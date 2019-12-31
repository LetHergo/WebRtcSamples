import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/client',
    name: 'client',
    component: () => import('../views/client.vue')
  },
  {
    path: '/clientVideo',
    name: 'clientVideo',
    component: () => import('../views/clientVideo.vue')
  },
  {
    path: '/sendVideo',
    name: 'sendVideo',
    component: () => import('../views/sendVideo.vue')
  },
  {
    path: '/send',
    name: 'send',
    component: () => import('../views/send.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
