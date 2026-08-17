import { createContext, useContext, useState, useEffect, useRef } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      // Check main app's user first
      const mainAppUser = localStorage.getItem('user')
      if (mainAppUser) {
        setUser(JSON.parse(mainAppUser))
      } else {
        // Fallback to agri_shop_user for backward compatibility
        const savedUser = localStorage.getItem('agri_shop_user')
        if (savedUser) setUser(JSON.parse(savedUser))
      }
    } catch (_) {}
    setLoading(false)
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const mainAppUser = localStorage.getItem('user')
        if (mainAppUser) {
          setUser(JSON.parse(mainAppUser))
        } else {
          const savedUser = localStorage.getItem('agri_shop_user')
          setUser(savedUser ? JSON.parse(savedUser) : null)
        }
      } catch (_) {}
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    // Store in both places for compatibility
    localStorage.setItem('agri_shop_user', JSON.stringify(userData))
    localStorage.setItem('user', JSON.stringify(userData))
    if (token) {
      localStorage.setItem('agri_shop_token', token)
      localStorage.setItem('token', token)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('agri_shop_user')
    localStorage.removeItem('agri_shop_token')
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('agri_shop_user', JSON.stringify(userData))
    localStorage.setItem('user', JSON.stringify(userData))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
