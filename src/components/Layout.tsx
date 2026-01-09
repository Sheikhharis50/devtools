import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Sidebar />
      <main className="min-h-screen">
        {children}
      </main>
    </>
  )
}

export default Layout
