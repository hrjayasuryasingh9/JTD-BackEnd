import React, { useState } from "react";
import "../src/login.css";

const Login = () => {
  const [signupDetails, setSignupDetails] = useState({
    username: "",
    email: "",
    password: "",
    role: "Customer",
  });
  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
    role: "Customer",
  });

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupDetails({ ...signupDetails, [name]: value });
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginDetails({ ...loginDetails, [name]: value });
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    console.log("Signup Details:", signupDetails);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log("Login Details:", loginDetails);
  };

  return (
    <div>
      <div className="main">
        <input type="checkbox" id="chk" aria-hidden="true" />

        <div className="signup">
          <form onSubmit={handleSignupSubmit}>
            <label htmlFor="chk" aria-hidden="true" className="Signup">
              Sign up
            </label>
            <input
              type="text"
              name="username"
              placeholder="User name"
              required
              value={signupDetails.username}
              onChange={handleSignupChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={signupDetails.email}
              onChange={handleSignupChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={signupDetails.password}
              onChange={handleSignupChange}
            />
            <select
              className="Role"
              name="role"
              value={signupDetails.role}
              onChange={handleSignupChange}
              required
            >
              <option value="Customer">Customer</option>
              <option value="Admin">Admin</option>
            </select>
            <button type="submit">Sign up</button>
          </form>
        </div>

        <div className="login">
          <form onSubmit={handleLoginSubmit}>
            <label htmlFor="chk" aria-hidden="true">
              Login
            </label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={loginDetails.email}
              onChange={handleLoginChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={loginDetails.password}
              onChange={handleLoginChange}
            />
            <select
              className="Role"
              name="role"
              value={signupDetails.role}
              onChange={handleSignupChange}
              required
            >
              <option value="Customer">Customer</option>
              <option value="Admin">Admin</option>
            </select>
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
