// src/layout/SidebarNav.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Badge,
} from "@mui/material";
import { navItems } from "./nav.config";

export default function SidebarNav({ open, onNavigate, roles = [] }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const canSee = (item) =>
    !item.roles || item.roles.some((r) => roles.includes(r));

  const isActive = (path) =>
    path ? pathname === path || pathname.startsWith(path + "/") : false;

  return (
    <List sx={{ py: 0 }}>
      {navItems.filter(canSee).map((item, idx) => {
        if (item.section) {
          return (
            <Typography
              key={`sec-${idx}`}
              variant="caption"
              sx={{
                px: open ? 2 : 1,
                pt: 1.5,
                pb: 0.5,
                color: "text.secondary",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.section}
            </Typography>
          );
        }

        if (item.dividerAbove) {
          return <Divider key={`div-${idx}`} sx={{ my: 1 }} />;
        }

        const Icon = item.icon;
        const active = isActive(item.path);

        const handleClick = () => {
          if (item.disabled) return;
          if (item.external && item.path) {
            window.open(item.path, "_blank", "noopener,noreferrer");
            onNavigate && onNavigate();
            return;
          }
          if (item.path) navigate(item.path);
          onNavigate && onNavigate();
        };

        return (
          <ListItemButton
            key={item.label + idx}
            selected={active}
            disabled={item.disabled}
            onClick={handleClick}
            sx={{
              py: 1.1,
              px: open ? 2 : 1.25,
              minHeight: 44,
              borderRadius: 1,
              mx: 1,
              my: 0.25,
              "&.Mui-selected": {
                bgcolor: "action.selected",
                "&:hover": { bgcolor: "action.selected" },
              },
              ...(open ? {} : { justifyContent: "center" }),
            }}
          >
            {Icon && (
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 1.5 : 0,
                  justifyContent: "center",
                }}
              >
                {item.badge ? (
                  <Badge color="primary" badgeContent={item.badge} overlap="circular">
                    <Icon fontSize="small" />
                  </Badge>
                ) : (
                  <Icon fontSize="small" />
                )}
              </ListItemIcon>
            )}
            {open && (
              <ListItemText
                primary={item.label}
                // primaryTypographyProps={{ noWrap: true }}
              />
            )}
          </ListItemButton>
        );
      })}
    </List>
  );
}
