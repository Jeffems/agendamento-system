export default function Login() {
    const handleGoogleLogin = () => {
      window.location.href = "http://localhost:3001/auth/google";
    };
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-96 text-center">
          <h1 className="text-2xl font-bold mb-6">Sistema de Agendamentos</h1>
  
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="w-5 h-5 bg-white p-1 rounded"
            />
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }
  