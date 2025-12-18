import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext';
import { AnimeContextProvider } from './context/AnimeContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Account from './pages/Account';
import Series from './pages/Series';
import Movies from './pages/Movies';
import NewPopular from './pages/NewPopular';
import MyList from './pages/MyList';
import Search from './pages/Search';
import TitleDetails from './pages/TitleDetails';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="app">
      <AuthContextProvider>
        <AnimeContextProvider>
          <Router>
            <Routes>
              <Route path='/login' element={<Login />} />
              <Route path='/signup' element={<Signup />} />
              <Route
                path='/'
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/series'
                element={
                  <ProtectedRoute>
                    <Series />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/movies'
                element={
                  <ProtectedRoute>
                    <Movies />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/new'
                element={
                  <ProtectedRoute>
                    <NewPopular />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/mylist'
                element={
                  <ProtectedRoute>
                    <MyList />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/search'
                element={
                  <ProtectedRoute>
                    <Search />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/title/:id'
                element={
                  <ProtectedRoute>
                    <TitleDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/account'
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AnimeContextProvider>
      </AuthContextProvider>
    </div>
  );
}

export default App;
