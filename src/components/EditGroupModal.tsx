import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { EditGroupModalProps, TGroupMember, TUser } from "../types";

export default function EditGroupModal({
  open,
  onClose,
  name,
  currentMembers,
  availableMembers,
  onSave,
}: EditGroupModalProps) {
  const [groupName, setGroupName] = useState(name);
  const [members, setMembers] = useState<TGroupMember[]>(currentMembers);
  const [selectedMembers, setSelectedMembers] = useState<TUser[]>([]);

  const handleAddMembers = () => {
    const toAdd = selectedMembers
      .filter(
        (selectedUser) =>
          !members.some((m) => m.user_id === selectedUser.user_id)
      )
      .map(
        (selectedUser): TGroupMember => ({
          user_id: selectedUser.user_id,
          user: selectedUser,
        })
      );

    if (toAdd.length > 0) {
      setMembers([...members, ...toAdd]);
      setSelectedMembers([]);
    }
  };

  // Filter available members to exclude those already in the group
  const filteredAvailableMembers = availableMembers.filter(
    (member) => !members.some((m) => m.user_id === member.user_id)
  );

  const handleRemoveMember = (memberUserId: string) => {
    setMembers((prev) => prev.filter((m) => m.user_id !== memberUserId));
  };

  const handleSave = async () => {
    await onSave(groupName, members);
    onClose();
  };

  const handleCancel = () => {
    setMembers(currentMembers); // Reset to original state
    setSelectedMembers([]);
    onClose();
  };

  const handleGroupNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setGroupName(event.target.value);
  };

  const handleSelectedMembersChange = (_: any, newValue: TUser[]) => {
    setSelectedMembers(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div">
          Uredi Grupu - {groupName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {members.length} članova
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ mb: 2, mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Ime grupe
          </Typography>
          <TextField
            required
            fullWidth
            id="group-name"
            label="Ime grupe"
            name="group-name"
            autoComplete="group-name"
            autoFocus
            value={groupName}
            onChange={handleGroupNameChange}
            size="small"
          />
        </Box>
        {/* Add Member Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Dodaj člana
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              sx={{ flex: 1 }}
              options={filteredAvailableMembers}
              getOptionLabel={(option) =>
                `${option.first_name} ${option.last_name}`
              }
              value={selectedMembers}
              onChange={handleSelectedMembersChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Izaberi člana"
                  variant="outlined"
                  size="small"
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Avatar
                    sx={{ mr: 2, width: 32, height: 32, fontSize: "0.875rem" }}
                  >
                    {option.avatar}
                  </Avatar>
                  <p>{`${option.first_name} ${option.last_name}`}</p>
                </Box>
              )}
              noOptionsText="Nema dostupnih članova"
            />
            <IconButton
              onClick={handleAddMembers}
              disabled={!selectedMembers.length}
              color="primary"
              sx={{ mb: 0.5 }}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Current Members List */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Trenutni članovi
          </Typography>
          {members.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "text.secondary",
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <PersonIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
              <Typography variant="body2">Nema članova u grupi</Typography>
            </Box>
          ) : (
            <List
              sx={{
                bgcolor: "background.paper",
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
              }}
            >
              {members.map((member, index) => (
                <ListItem
                  key={member.user_id}
                  divider={index < members.length - 1}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {member.user.avatar}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${member.user.first_name} ${member.user.last_name}`}
                    secondary={`Poredak - ${index + 1}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveMember(member.user_id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleCancel} color="inherit">
          Odustani
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          startIcon={<PersonIcon />}
        >
          Spremi
        </Button>
      </DialogActions>
    </Dialog>
  );
}
