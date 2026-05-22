import { BrowserRouter } from "react-router-dom";
import AdminRoutes from "./Component/Routes/AdminRoutes";
import UserRoutes from "./Component/Routes/UserRoutes";


function App() {


  return (
    <BrowserRouter>

      <div className="min-h-screen transition-colors duration-300"
           style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
     
      <AdminRoutes />
      <UserRoutes />
      </div>
     
    </BrowserRouter>
  );
}

export default App;
