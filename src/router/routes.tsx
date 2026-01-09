import { createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import DashboardPage from '@/pages/dashboard'
import TimeComparisonPage from '@/pages/time-comparison'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})

const routes = rootRoute.addChildren([
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: DashboardPage,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/time-comparison',
    component: TimeComparisonPage,
  })
])

export default routes