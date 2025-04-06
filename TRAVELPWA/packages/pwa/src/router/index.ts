import useCustomUser from '@/composables/useCustomUser'
import useFirebase from '@/composables/useFirebase'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// ROUTES
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('@/views/HomeScreen.vue'),
        name: 'home',
      },
      {
        path: '/login',
        component: () => import('@/views/auth/LoginScreen.vue'),
      },
      {
        path: '/infomail',
        component: () => import('@/views/InfoMail.vue'),
        name: 'infomail',
      },
      {
        path: '/mybookings/:slug',
        component: () => import('@/views/mybookings/_slug.vue'),
        name: 'mybookingsbyid',
        meta: { shouldBeAuthenticated: true },
      },
      {
        path: '/oldbookings/:slug',
        component: () => import('@/views/oldbookings/_slug.vue'),
        name: 'oldbookingsbyid',
        meta: { shouldBeAuthenticated: true },
      },
      {
        path: '/trip/:slug',
        name: 'tripbyname',
        component: () => import('@/views/trips/_slug.vue'),
      },
      {
        path: '/trip/bookable/:slug',
        name: 'bookabletripbyname',
        component: () => import('@/views/trips/bookable/_slug.vue'),
      },
      {
        path: '/booking/trip/:slug',
        component: () => import('@/views/booking/trip/_slug.vue'),
        name: 'bookingtrip',
        meta: { shouldBeAuthenticated: true },
      },
      {
        path: '/auth',
        component: () => import('@/components/wrappers/AuthWrapper.vue'),
        meta: { preventLoggedIn: true },
        children: [
          {
            path: 'login',
            name: 'login',
            component: () => import('@/views/auth/LoginScreen.vue'),
          },
          {
            path: 'register',
            name: 'register',
            component: () => import('@/views/auth/RegisterScreen.vue'),
          },
          {
            path: 'forgot-password',
            name: 'forgot-password',
            component: () => import('@/views/auth/ForgotPasswordScreen.vue'),
          },
        ],
      },
      {
        path: '/unauthorized',
        component: () => import('@/views/UnauthorizedScreen.vue'),
        name: 'unauthorized',
      },
      {
        path: '/myaccount',
        name: 'myaccount',
        component: () => import('@/views/MyAccount.vue'),
      },
      {
        path: '/:pathMatch(.*)*',
        component: () => import('@/views/NotFound.vue'),
      },
    ],
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    name: 'admin',
    meta: { shouldBeAdmin: true, shouldBeAuthenticated: true },
    redirect: { name: 'admin-dashboard' },
    children: [
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
      },
      {
        path: 'activities',
        name: 'admin-activities',
        component: () => import('@/views/admin/activities/ActivitiesView.vue'),
      },
      {
        path: 'activity/:slug',
        name: 'admin-activity',
        component: () => import('@/views/admin/activities/_slug.vue'),
      },
      {
        path: 'activity/bookable/:slug',
        name: 'admin-bookable-activity',
        component: () => import('@/views/admin/activities/bookable/_slug.vue'),
      },
      {
        path: 'trips',
        name: 'admin-trips',
        component: () => import('@/views/admin/trips/IndexView.vue'),
      },
      {
        path: 'trip/:slug',
        name: 'admin-trip',
        component: () => import('@/views/admin/trips/_slug.vue'),
      },
      {
        path: 'trip/bookable/:slug',
        name: 'admin-bookable-trip',
        component: () => import('@/views/admin/trips/bookable/_slug.vue'),
      },
      // {
      //   path: 'bookings',
      //   name: 'admin-Bookings',
      //   component: () => import('@/views/admin/booking/IndexView.vue'),
      // },
      {
        path: 'booking/:slug',
        name: 'admin-booking',
        component: () => import('@/views/admin/booking/_slug.vue'),
      },
      {
        path: 'chat',
        name: 'admin-chat',
        component: () => import('@/views/admin/ChatView.vue'),
      },
      {
        path: 'clients',
        name: 'admin-clients',
        component: () => import('@/views/admin/ClientsView.vue'),
      },
      {
        path: 'user-settings',
        name: 'admin-settings',
        component: () => import('@/views/admin/SettingsView.vue'),
      },
    ],
  },
  {
    path: '/guide',
    component: () => import('@/layouts/GuideLayout.vue'),
    name: 'guide',
    meta: { shouldBeGuide: true, shouldBeAuthenticated: true },
    redirect: { name: 'guide-dashboard' },
    children: [
      {
        path: 'dashboard',
        name: 'guide-dashboard',
        component: () => import('@/views/guide/DashboardView.vue'),
      },
      {
        path: 'chat',
        name: 'guide-chat',
        component: () => import('@/views/guide/ChatView.vue'),
      },
      {
        path: 'reports',
        name: 'guide-reports',
        component: () => import('@/views/guide/ReportsView.vue'),
      },
    ],
  },
]

// THE ROUTER ITSELF
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

router.beforeEach(async (to, from, next) => {
  const { firebaseUser } = useFirebase()
  const { restoreCustomUser, customUser } = useCustomUser() // Use the custom user composable

  // Restore the custom user (this might be an async call)
  await restoreCustomUser()

  if (to.meta.shouldBeAuthenticated && !firebaseUser.value) {
    next({ name: 'login' })
  } else if (to.meta.preventLoggedIn && firebaseUser.value) {
    next({ name: 'home' })
  } else if (
    to.meta.shouldBeAdmin &&
    (!customUser.value || !customUser.value.role.includes('ADMIN'))
  ) {
    console.warn(
      'User does not have admin role, redirecting to unauthorized page',
    )
    next({ name: 'unauthorized' })
  } else if (
    to.meta.shouldBeGuide &&
    (!customUser.value || !customUser.value.role.includes('GUIDE'))
  ) {
    console.warn(
      'User does not have guide role, redirecting to unauthorized page',
    )
    next({ name: 'unauthorized' })
  } else {
    next()
  }
})

export default router
