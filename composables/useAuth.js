export const useAuth = () => {
    const token = useCookie('token')
    const rolId = useCookie('rolId')
    const colaboradorId = useCookie('colaboradorId')
    const router = useRouter()

    const isAuthenticated = computed(() => !!token.value)

    const userRole = computed(() => parseInt(rolId.value) || 0)

    const roleNames = {
        1: 'Cajero',
        2: 'Administrador',
        4: 'Mesero',
        5: 'Postre'
    }

    const roleName = computed(() => roleNames[userRole.value] || 'Sin rol')

    const logout = async () => {
        token.value = null
        rolId.value = null
        colaboradorId.value = null
        if (process.client) {
            window.localStorage.removeItem('theme')
        }
        await router.push('/login')
    }

    const hasPermission = (requiredRoles) => {
        if (!requiredRoles || requiredRoles.length === 0) return true
        return requiredRoles.includes(userRole.value)
    }

    return {
        isAuthenticated,
        userRole,
        roleName,
        logout,
        hasPermission
    }
}