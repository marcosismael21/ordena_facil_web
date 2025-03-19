export default defineNuxtRouteMiddleware((to, from) => {
    const rolId = useCookie('rolId')

    // Verificar si la ruta tiene requisitos de rol
    if (to.meta.requiredRoles && to.meta.requiredRoles.length > 0) {
        // Verificar si el rol del usuario está en la lista de roles permitidos
        if (!to.meta.requiredRoles.includes(parseInt(rolId.value))) {
            // Redirigir a una página de acceso denegado o a la página principal
            return navigateTo('/acceso-denegado')
        }
    }
})