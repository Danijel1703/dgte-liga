import { Search } from "@mui/icons-material";
import { InputAdornment, TextField } from "@mui/material";

interface PlayerSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function PlayerSearch({
  searchTerm,
  onSearchChange,
}: PlayerSearchProps) {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <TextField
      fullWidth
      placeholder="Pretraži igrače po imenu, prezimenu, emailu ili telefonu..."
      value={searchTerm}
      onChange={handleSearchChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
      }}
      sx={{ mb: 3 }}
    />
  );
}
