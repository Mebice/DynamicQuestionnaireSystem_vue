import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/ForestageList',
      name: 'ForestageList',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/ForestageList.vue')
    },
    {
      path: '/ForestageAnswer',
      name: 'ForestageAnswer',
      component: () => import('../views/ForestageAnswer.vue'),
    },
    {
      path: '/ForestageConfirm',
      name: 'ForestageConfirm',
      component: () => import('../views/ForestageConfirm.vue')
    },
    {
      path: '/Statistics',
      name: 'Statistics',
      component: () => import('../views/Statistics.vue')
    },
    {
      path: '/BackstageList',
      name: 'BackstageList',
      component: () => import('../views/BackstageList.vue')
    },
    
    {
      path: '/BackstageQuestionnaire',
      name: 'BackstageQuestionnaire',
      component: () => import('../views/BackstageQuestionnaire.vue')
    },
    {
      path: '/BackstageQuestion',
      name: 'BackstageQuestion',
      component: () => import('../views/BackstageQuestion.vue')
    },
    {
      path: '/BackstageConfirm',
      name: 'BackstageConfirm',
      component: () => import('../views/BackstageConfirm.vue')
    },
    {
      path: '/EditQuestionnaire',
      name: 'EditQuestionnaire',
      component: () => import('../views/EditQuestionnaire.vue'),
    },
    {
      path: '/EditConfirm',
      name: 'EditConfirm',
      component: () => import('../views/EditConfirm.vue'),
    },
    {
      path: '/UserFeedback',
      name: 'UserFeedback',
      component: () => import('../views/UserFeedback.vue'),
    },
    {
      path: '/AnswerRecord',
      name: 'AnswerRecord',
      component: () => import('../views/AnswerRecord.vue'),
    },
    // {
    //   path: '/Test',
    //   name: 'Test',
    //   component: () => import('../views/Test.vue'),
    // },
  ]
})

export default router
