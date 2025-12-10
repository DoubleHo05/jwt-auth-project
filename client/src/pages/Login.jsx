import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, isLoggingIn, isLoginError, loginError } = useAuth();

  const onSubmit = (data) => login(data);

  return (
    <div className="card">
      <h2>Login</h2>
      
      {isLoginError && (
        <div className="error-box">
           {loginError?.response?.data || "Invalid credentials provided."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Email Address</label>
          <input 
            {...register("email", { 
              required: "Email is required",
              pattern: { value: /^\S+@\S+$/i, message: "Please enter a valid email" }
            })} 
            placeholder="user@test.com"
          />
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input 
            type="password"
            {...register("password", { required: "Password is required" })} 
            placeholder="••••••••"
          />
          {errors.password && <p className="error-text">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isLoggingIn}>
          {isLoggingIn ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default Login;