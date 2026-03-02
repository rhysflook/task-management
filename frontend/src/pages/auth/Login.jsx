import { Box, Button, FormHelperText, FormLabel, Input, Typography } from "@mui/joy";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLazyFetchUserQuery, useLazyGetCsrfTokenQuery, useLoginMutation } from "../../services/auth";
import { setUser } from "../../stores/reducers/authSlice";
import { useDispatch } from "react-redux";
import backgroundImage from '../../assets/login-background.png';
import icon from '../../assets/logos/nursecarecall-icon.png';
import logo from '../../assets/logos/nursecarecall-logo.png';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
const Login = () => {
	
	const [form, setForm] = useState({
		staff_id: '',
		password: '',
	});

	const [loginError, setLoginError] = useState("");
	const [getCsrf] = useLazyGetCsrfTokenQuery();
	const [login] = useLoginMutation();
	const [fetchUser] = useLazyFetchUserQuery();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleLogin = async () => {
		try {
			setLoginError("");
			await getCsrf().unwrap(); // Required by Sanctum
			await login({
				staff_id: form.staff_id,
				password: form.password,
			}).unwrap();
			setTimeout(() => {}, 1000); // Optional delay for UX
			const user = await fetchUser().unwrap();
			dispatch(setUser(user));
		} catch (err) {
			console.error('Login failed:', err);
			if (err.data.status === 403) {
				setLoginError("この操作は現在ご利用できません。管理者にお問合せください。");
			} else {
				setLoginError("ログインに失敗しました。スタッフIDとパスワードを確認してください。");
			}
		}
	};
	return (
		<Box
			sx={{
				margin: 0,
				height: "100vh",
				width: "100vw",
				backgroundImage: `url(${backgroundImage})`,
				backgroundSize: "cover",
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Box sx={{ width: "90%", height: "80%", display: "flex", justifyContent: "center", alignItems:"center" }}>
				<Box sx={{ display:"flex", height: "100%", alignItems: "flex-start", width: "55%",  }}>
					<Box sx={{ display: "flex", alignItems: "center",   }}> 	
						<Box component="img"
							src={icon} sx={{ height: "120px" }}></Box>
						<Box component="img"  sx={{ width: "350px" }}
							src={logo}></Box>
					</Box>
				</Box>
				<Box sx={{  height: "100%", width: {sm: "45%", md: "45%", lg: "35%"}, display: "flex", justifyContent: "center", alignItems: "center",  }}>
					<Box sx={{ 
						height: "100%",
						background: "#FBFAFD",
						borderRadius: "12px", display: "flex", flexDirection: "column", justifyContent: "center", padding: "3rem",  width: "80%", 
						boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
						
					}}
						component="form"
						onSubmit={handleLogin}
					>
						<Typography level="h1" sx={{ fontWeight: "bold", marginBottom: "1rem", width: "100%", textAlign: "center", color: "#558C58" }}>
							ログイン
						</Typography>
						<Box sx={{ 
							display: "flex", alignItems: "center", marginTop: "1rem", borderRadius: "10px", border: "1px solid #e1e1e9ff", background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" 
								,"&:focus-within": {
							borderColor: "#558C58",
							boxShadow: "0 0 0 2px rgba(85,140,88,0.25)",
							},
							"&.Mui-focused div": {
								outline: "none",
							},
							}}>
							<PersonIcon sx={{ fontSize: 34, color: "#91BDB0", marginLeft: "0.5rem" }} />
							<Input
								name="staff_id"
								value={form.staff_id}
								onChange={handleChange}
								placeholder="ログインID"
								sx={{ 
									'--Input-focusedThickness': '0',
									flex: 1, border: "none", boxShadow: "none", background: "transparent", fontSize: "1.3rem", lineHeight: "1.5rem", height: "3rem",
									
    "& input": {
      outline: "none !important",   // no blue browser outline
    },}}
								disableUnderline
							/>
						</Box>
						<Box sx={{ 
							display: "flex", alignItems: "center", marginTop: "1rem", borderRadius: "10px", border: "1px solid #e1e1e9ff", background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
							,"&:focus-within": {
								borderColor: "#558C58",
								boxShadow: "0 0 0 2px rgba(85,140,88,0.25)",
							},
							}}>
							<LockIcon sx={{ fontSize: 32, color: "#91BDB0", marginLeft: "0.5rem" }} />
							<Input
								type="password"
								name="password"
								value={form.password}
								placeholder="パスワード"
								sx={{'--Input-focusedThickness': '0', flex: 1, border: "none", boxShadow: "none", background: "transparent", fontSize: "1.3rem", lineHeight: "1.5rem", height: "3rem" }}
								onChange={handleChange}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleLogin();
									}
								}}
								disableUnderline
							/>
						</Box>
						<Button sx={{ 
							marginTop: "2rem",
							background: 'linear-gradient(90deg, #A4C669 0%, #6BAC9F 100%)',
							borderRadius: '15px',
							color: 'white',
							padding: '0.75rem',
							fontSize: '1.2rem',
							fontWeight: 'bold',
							boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
							'&:hover': {
								background: 'linear-gradient(90deg, #6BAC9F 0%, #A4C669 100%)',
							},
						 }} onClick={handleLogin}>ログイン</Button>
						<FormHelperText sx={{ 
							color: 'red',
							marginTop: '1rem',
						}}>
							{loginError}
						</FormHelperText>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default Login;
