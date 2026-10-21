import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import Analytics from "./pages/Analytics";
import Budgets from "./pages/Budgets";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Logout from "./pages/Logout";

import Login from "./pages/Login";
import Register from "./pages/Register";

import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* ========================= */}
                {/* PUBLIC ROUTES */}
                {/* ========================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ========================= */}
                {/* PROTECTED ROUTES */}
                {/* ========================= */}

                <Route element={<ProtectedRoute />}>

                    <Route
                        path="/"
                        element={
                            <AppLayout>
                                <Home />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/expenses"
                        element={
                            <AppLayout>
                                <Expenses />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/income"
                        element={
                            <AppLayout>
                                <Income />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/analytics"
                        element={
                            <AppLayout>
                                <Analytics />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/budgets"
                        element={
                            <AppLayout>
                                <Budgets />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/settings"
                        element={
                            <AppLayout>
                                <Settings />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/help"
                        element={
                            <AppLayout>
                                <Help />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/logout"
                        element={
                            <AppLayout>
                                <Logout />
                            </AppLayout>
                        }
                    />

                </Route>

            </Routes>

        </BrowserRouter>
    );
}


function AppLayout({ children }) {
    return (
        <div className="flex h-screen overflow-hidden">

            <NavBar />

            <main className="flex-1 overflow-y-auto">
                {children}
            </main>

        </div>
    );
}


export default App;