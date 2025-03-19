export default defineNuxtRouteMiddleware((to, from) => {
    const token = useCookie('token')

    // Si no hay token y la ruta no es login, redirigir a login
    if (!token.value && to.path !== '/login') {
        return navigateTo('/login')
    }
})