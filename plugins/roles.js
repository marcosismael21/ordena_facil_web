export default defineNuxtPlugin((nuxtApp) => {
    const hasRole = (requiredRole) => {
        const rolId = useCookie('rolId')
        return parseInt(rolId.value) === requiredRole
    }

    const hasAnyRole = (requiredRoles) => {
        const rolId = useCookie('rolId')
        return requiredRoles.includes(parseInt(rolId.value))
    }

    return {
        provide: {
            hasRole,
            hasAnyRole
        }
    }
})