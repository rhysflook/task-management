import { Outlet, useNavigate } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useAppDispatch, useAppSelector } from "../../stores/hooks";
import { useLogoutMutation } from "../../services/auth";
import { clearUser } from "../../stores/reducers/authSlice";


const MainLayout = () => {

	const dispatch = useAppDispatch();

	const { user } = useAppSelector((state) => state.auth);
	const navigate = useNavigate();
	const [logout] = useLogoutMutation();

	return <>
		<Box sx={{ flexGrow: 1, width: "100%" }} >
		<AppBar position="static">
			<Toolbar>
				<IconButton
					size="large"
					edge="start"
					color="inherit"
					aria-label="menu"
					sx={{ mr: 2 }}
				>
					<MenuIcon />
				</IconButton>
				<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
					Dashboard
				</Typography>
				<Button color="inherit"
					onClick={() => {
						if (!user) {
							navigate("/login");
						} else {
							// logout logic here
							logout().unwrap();
							dispatch(clearUser());
							navigate("/login");
						}
					}}
				>{!user ? "Login" : "Logout"}</Button>
			</Toolbar>
		</AppBar>
		</Box>
		<main>
        	<Outlet />
      	</main>
	</>
}
export default MainLayout;