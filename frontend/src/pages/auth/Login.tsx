import { Box, Button, FormLabel, Input, Typography } from "@mui/joy";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLazyFetchUserQuery, useLazyGetCsrfTokenQuery, useLoginMutation } from "../../services/auth";
import { useAppDispatch } from "../../stores/hooks";
import { setUser } from "../../stores/reducers/authSlice";


const Login = () => {
	const [form, setForm] = useState({
		email: '',
		password: '',
	  });
	const [getCsrf] = useLazyGetCsrfTokenQuery();
	const [login] = useLoginMutation();
	const [fetchUser] = useLazyFetchUserQuery();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleLogin = async () => {
	  try {
		await getCsrf().unwrap(); // Required by Sanctum
		await login({
		  email: form.email,
		  password: form.password,
		}).unwrap();
		setTimeout(() => {}, 1000); // Optional delay for UX
		const user = await fetchUser().unwrap();
  		dispatch(setUser(user));
		navigate('/'); // Redirect to home page after successful Login
	  } catch (err) {
		console.error('Login failed:', err);
	  }
	};
	  return (
		<Box sx={{ width: '300px', margin: 'auto', padding: '20px', textAlign: 'center' }}>
			<FormLabel sx={{ marginTop: "2rem" }}>{"Email"}</FormLabel>
			<Input name="email" onChange={handleChange} />
			<FormLabel sx={{ marginTop: "2rem" }}>{"Password"}</FormLabel>
			<Input type="password" name="password" onChange={handleChange} />
			<Button sx={{ marginTop: "2rem" }} onClick={handleLogin}>Login</Button>

			<Typography sx={{ marginTop: "2rem" }}>{"Don't have an account?"}</Typography>
			<Button sx={{ marginTop: "2rem" }} onClick={() => navigate('/register')}>Register</Button>
		</Box>
	);
}

export default Login;



