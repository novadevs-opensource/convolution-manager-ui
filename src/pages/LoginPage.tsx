// src/pages/LoginPage.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import wuaiLogo from '../assets/images/wuai-logo-long-black.svg';
import PhantomLogin from '../components/PhantomLogin';
import useIsMobile from '../hooks/useIsMobile';

const LoginPage: React.FC = () => {
  const { login: _login, isAuthenticated } = useAuth();
  //const navigate = useNavigate();
  //const { addNotification } = useToasts();

  //const [email, setEmail] = useState('');
  //const [password, setPassword] = useState('');

  const renderFooter = () => {
    return (
      <section className="sm:hidden px-8 py-4 bg-beige-700 left-0 bottom-0 w-full absolute">
        <div className="mx-auto flex flex-row gap-3 md:items-center justify-between">
          <p className="text-white text-afacad text-sm"><a href='https://wuai.io' target='_blank'>2025 © wuai.io</a></p>
          <div className="flex flex-row gap-3">
              <p className="text-white text-afacad text-sm">
                  <a href="https://wuai.gitbook.io/doc/1.-project-overview" target="_blank">About</a>
              </p>

              <p className="text-white text-afacad text-sm hidden md:block">/</p>
              <p className="text-white text-afacad text-sm">
                  <a href="https://wuai.gitbook.io/doc/4.-tokenomics" target="_blank">Whitepaper</a>
              </p>

              <p className="text-white text-afacad text-sm hidden md:block">/</p>
              <p className="text-white text-afacad text-sm">
                  <a href="https://x.com/WuAIBSC" target="_blank">X</a>
              </p>
              {/*
              <p className="text-white text-afacad text-sm hidden md:block">/</p>
              <p className="text-white text-afacad text-sm">
                  <a href="https://github.com/WuAIBSC" target="_blank">GitHub</a>
              </p>
              */}
          </div>
        </div>
      </section>
    );
  }

  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <div className="flex h-screen items-center justify-center bg-black-ultra">
        <div className="text-center p-8 border rounded-lg shadow-lg w-10/12 bg-gradient-secondary">
          <img src={wuaiLogo} alt="WuAI Logo" className="mx-auto w-24 mb-4" />
          <h1 className="text-2xl font-bold mb-2 font-anek-latin">Soon</h1>
          <p className="text-gray-600">
            This application <b>is only available for desktop users</b>. Please access it from a desktop computer.
          </p>
        </div>
        {renderFooter()}
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  /*
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await loginService(email, password);
      login(token);
      addNotification('Login successful!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error en el login', error);
      addNotification(JSON.stringify(error), 'error');
    }
  };
  */

  return (
    /* component */
    <div className="flex h-screen">
        {/* left pane */}
        <div className="hidden relative lg:flex items-center justify-center flex-1 bg-white text-black bg-yellow-500">
          <div className="text-center rounded-md h-[250px] w-[350px] justify-center items-center flex">
            <img src={wuaiLogo} className="logo w-[250px]" alt="Vite logo" />
          </div>
          <section className="px-8 py-4 bg-beige-700 absolute left-0 bottom-0 w-full">
            <div className="mx-auto flex md:flex-row gap-3 flex-col md:items-center justify-between">
                <p className="text-white text-afacad text-sm"><a href='https://wuai.io' target='_blank'>2025 © wuai.io</a></p>
                <div className="flex md:flex-row flex-col gap-3">
                    <p className="text-white text-afacad text-sm">
                        <a href="https://wuai.gitbook.io/doc/1.-project-overview" target="_blank">About</a>
                    </p>

                    <p className="text-white text-afacad text-sm hidden md:block">/</p>
                    <p className="text-white text-afacad text-sm">
                        <a href="https://wuai.gitbook.io/doc/4.-tokenomics" target="_blank">Whitepaper</a>
                    </p>

                    <p className="text-white text-afacad text-sm hidden md:block">/</p>
                    <p className="text-white text-afacad text-sm">
                        <a href="https://x.com/WuAIBSC" target="_blank">X</a>
                    </p>
                    {/*
                    <p className="text-white text-afacad text-sm hidden md:block">/</p>
                    <p className="text-white text-afacad text-sm">
                        <a href="https://github.com/WuAIBSC" target="_blank">GitHub</a>
                    </p>
                    */}
                </div>
            </div>
          </section>
        </div>
        {/* right pane */}
        <div className="w-full bg-yellow-50 lg:w-1/2 flex flex-col items-center justify-center relative">
          <div className='items-center justify-center flex flex-col rounded-xl p-8 sm:h-[250px] sm:w-[350px]'>
            <div className="sm:hidden max-w-sm text-center p-12 rounded-md">
              <img src={wuaiLogo} className="logo h-24" alt="Vite logo" />
            </div>
            <div className="max-w-md w-full flex flex-col items-center p-6">
              <h1 className="text-3xl font-semibold mb-3 text-black text-center inline-flex">Sign In</h1>
              <div className="flex justify-center relative">
                <h2 className="font-anek-latin text-black text-center text-center mb-6 inline-block px-4 relative">
                  <span className="relative z-10">Create WuAI <b>agents</b> using your wallet</span>
                  <span 
                    className="absolute inset-0 bg-yellow-500 z-0"
                    style={{
                      transform: "rotate(-2.5deg)",
                      borderRadius: "3% 20% 5% 20%"
                    }}
                  ></span>
                </h2>
              </div>
              <PhantomLogin />
              {/*
              <div className="mt-4 flex flex-col items-center justify-between gap-2">
                <div className="w-full">
                  <button disabled={true} type="button" className="w-full flex justify-center items-center gap-2 bg-white text-sm text-gray-600 p-2 rounded-md hover:bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4" id="google">
                      <path fill="#fbbb00" d="M113.47 309.408 95.648 375.94l-65.139 1.378C11.042 341.211 0 299.9 0 256c0-42.451 10.324-82.483 28.624-117.732h.014L86.63 148.9l25.404 57.644c-5.317 15.501-8.215 32.141-8.215 49.456.002 18.792 3.406 36.797 9.651 53.408z"></path>
                      <path fill="#518ef8" d="M507.527 208.176C510.467 223.662 512 239.655 512 256c0 18.328-1.927 36.206-5.598 53.451-12.462 58.683-45.025 109.925-90.134 146.187l-.014-.014-73.044-3.727-10.338-64.535c29.932-17.554 53.324-45.025 65.646-77.911h-136.89V208.176h245.899z"></path>
                      <path fill="#28b446" d="m416.253 455.624.014.014C372.396 490.901 316.666 512 256 512c-97.491 0-182.252-54.491-225.491-134.681l82.961-67.91c21.619 57.698 77.278 98.771 142.53 98.771 28.047 0 54.323-7.582 76.87-20.818l83.383 68.262z"></path>
                      <path fill="#f14336" d="m419.404 58.936-82.933 67.896C313.136 112.246 285.552 103.82 256 103.82c-66.729 0-123.429 42.957-143.965 102.724l-83.397-68.276h-.014C71.23 56.123 157.06 0 256 0c62.115 0 119.068 22.126 163.404 58.936z"></path>
                    </svg> Sign In with Google </button>
                </div>
                <div className="w-full">
                  <button disabled={true} type="button" className="w-full flex justify-center items-center gap-2 bg-white text-sm text-gray-600 p-2 rounded-md hover:bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" id="github" className="w-4">
                      <path d="M7.999 0C3.582 0 0 3.596 0 8.032a8.031 8.031 0 0 0 5.472 7.621c.4.074.546-.174.546-.387 0-.191-.007-.696-.011-1.366-2.225.485-2.695-1.077-2.695-1.077-.363-.928-.888-1.175-.888-1.175-.727-.498.054-.488.054-.488.803.057 1.225.828 1.225.828.714 1.227 1.873.873 2.329.667.072-.519.279-.873.508-1.074-1.776-.203-3.644-.892-3.644-3.969 0-.877.312-1.594.824-2.156-.083-.203-.357-1.02.078-2.125 0 0 .672-.216 2.2.823a7.633 7.633 0 0 1 2.003-.27 7.65 7.65 0 0 1 2.003.271c1.527-1.039 2.198-.823 2.198-.823.436 1.106.162 1.922.08 2.125.513.562.822 1.279.822 2.156 0 3.085-1.87 3.764-3.652 3.963.287.248.543.738.543 1.487 0 1.074-.01 1.94-.01 2.203 0 .215.144.465.55.386A8.032 8.032 0 0 0 16 8.032C16 3.596 12.418 0 7.999 0z"></path>
                    </svg> Sign In with Github </button>
                </div>
                <div className="w-full">
                  <button type="button" className="w-full flex justify-center items-center gap-2 bg-white text-sm text-gray-600 p-2 rounded-md hover:bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors duration-300">
                    Sign in with email 
                  </button>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 text-center">
                <p>or with your Wallet</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    name='email'
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    type="text" 
                    className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input 
                    name='password'
                    value={password}
                    onChange={(ev) => setPassword(ev.target.value)}
                    type="password" 
                    className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-300"
                  />
                </div>
                <div>
                  <button type="submit" className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300">Sign In</button>
                </div>
              </form>

              <div className="mt-4 text-sm text-gray-600 text-center">
                <p>Don't have an account? <a href="/register" className="text-black hover:underline">Register here</a>
                </p>
              </div>
              */}
            </div>
          </div>
          {renderFooter()}
        </div>
    </div>
  );
};

export default LoginPage;
