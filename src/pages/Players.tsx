import { Person } from "@mui/icons-material";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { usePlayers } from "../hooks/usePlayers";
import { useSearchFilter } from "../hooks/useFiltering";
import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import ErrorMessage from "../components/common/ErrorMessage";
import SuccessMessage from "../components/common/SuccessMessage";
import PlayerSearch from "../components/players/PlayerSearch";
import PlayerTable from "../components/players/PlayerTable";

export default function Players() {
  const [searchTerm, setSearchTerm] = useState("");
  const { players, loading, error, success, deletePlayer, clearMessages } =
    usePlayers();

  const filteredPlayers = useSearchFilter(players, searchTerm, [
    "first_name",
    "last_name",
    "email",
    "phone",
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Igrači"
        subtitle="Lista registriranih igrača"
        icon={<Person />}
      />

      {error && <ErrorMessage message={error} onClose={clearMessages} />}
      {success && <SuccessMessage message={success} onClose={clearMessages} />}

      <PlayerSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <PlayerTable
        players={filteredPlayers}
        onDeletePlayer={deletePlayer}
        loading={loading}
      />
    </PageContainer>
  );
}
