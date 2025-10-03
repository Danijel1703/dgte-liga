import {
  AccountCircle,
  Group,
  Home,
  Leaderboard,
  Logout,
  Menu,
  Person,
  PersonAdd,
  Schedule,
  Rule,
  Payment,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { supabase } from "../utils/supabase";
import { useUsers } from "../providers/UsersProvider";
import { useAuth } from "../providers/AuthProvider";

const drawerWidth = 240;

const menuItems = [
  { text: "Početna", icon: <Home />, path: "/" },
  { text: "Igrači", icon: <Person />, path: "/players" },
  // "Dodaj igrača" will be shown only for admins below
  { text: "Dodaj igrača", icon: <PersonAdd />, path: "/add-player", adminOnly: true as const },
  { text: "Grupe", icon: <Group />, path: "/groups" },
  { text: "Raspored", icon: <Schedule />, path: "/matches" },
  { text: "Rang lista", icon: <Leaderboard />, path: "/rankings" },
  { text: "Pravila", icon: <Rule />, path: "/rules" },
  { text: "Uplate", icon: <Payment />, path: "/payment" },
  { text: "Profil", icon: <AccountCircle />, path: "/profile" },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { users } = useUsers();
  const { user } = useAuth();
  const currentUser = users.find((u) => u.user_id === user?.id);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawerContent = (
    <>
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ fontWeight: 600 }}
        >
          DGTE - LIGA
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems
            .filter((item) => !item.adminOnly || currentUser?.is_admin)
            .map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "white",
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Button
        variant="text"
        sx={{
          marginTop: "auto",
        }}
        onClick={() => supabase.auth.signOut()}
        startIcon={<Logout />}
      >
        Odjava
      </Button>
    </>
  );

  return (
    <>
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              DGTE - LIGA
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "#f5f5f5",
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
    </>
  );
}
