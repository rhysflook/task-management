import { Box, Button, FormLabel, Input } from "@mui/joy";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLazyFetchUserQuery, useLazyGetCsrfTokenQuery, useRegisterMutation } from "../../services/auth";


const Registration = () => {
	const [form, setForm] = useState({
		name: '',
		email: '',
		password: '',
		password_confirmation: '',
	  });
	const [getCsrf] = useLazyGetCsrfTokenQuery();
	const [register] = useRegisterMutation();
	const [getUser] = useLazyFetchUserQuery();

	const navigate = useNavigate();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleRegister = async () => {
	  try {
		await getCsrf().unwrap(); // Required by Sanctum
		await register({
		  name: form.name,
		  email: form.email,
		  password: form.password,
		  password_confirmation: form.password_confirmation,
		}).unwrap();
		await getUser().unwrap();

		navigate('/'); // Redirect to home page after successful registration
	  } catch (err) {
		console.error('Registration failed:', err);
	  }
	};
	  return (
		<Box sx={{ width: '300px', margin: 'auto', padding: '20px', textAlign: 'center' }}>
			<FormLabel sx={{ marginTop: "2rem" }}>{"Name"}</FormLabel>
			<Input name="name" onChange={handleChange} />
			<FormLabel sx={{ marginTop: "2rem" }}>{"Email"}</FormLabel>
			<Input name="email" onChange={handleChange} />
			<FormLabel sx={{ marginTop: "2rem" }}>{"Password"}</FormLabel>
			<Input type="password" name="password" onChange={handleChange} />
			<FormLabel sx={{ marginTop: "2rem" }}>{"Confirm Password"}</FormLabel>
			<Input type="password" name="password_confirmation" onChange={handleChange} />

			<Button sx={{ marginTop: "2rem" }} onClick={handleRegister}>Register</Button>
		</Box>
	);
}

export default Registration;



