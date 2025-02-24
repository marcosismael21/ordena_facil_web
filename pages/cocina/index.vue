<template>
    <v-container fluid class="pa-4">
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-6">Panel de Cocina</h1>
            </v-col>
        </v-row>

        <!-- Grid de pedidos -->
        <v-row>
            <v-col v-for="pedido in pedidosPendientes" :key="pedido.id" cols="12" md="6" lg="4">
                <v-card class="order-card">
                    <v-card-title class="d-flex justify-space-between align-center pa-4">
                        <div>
                            <span class="text-h6">Orden #{{ pedido.numeroOrden }}</span>
                            <div class="text-subtitle-2">{{ pedido.nombreCliente }}</div>
                        </div>
                        <v-chip color="warning" class="ml-2">
                            Pendiente
                        </v-chip>
                    </v-card-title>

                    <v-divider></v-divider>

                    <v-card-text class="pa-4">
                        <v-list density="compact">
                            <v-list-item v-for="detalle in pedido.detalles" :key="detalle.id" class="mb-2">
                                <template v-slot:prepend>
                                    <v-chip size="small" color="primary" class="mr-2">
                                        {{ detalle.cantidad }}x
                                    </v-chip>
                                </template>
                                <v-list-item-title>{{ detalle.nombrePlatillo }}</v-list-item-title>
                                <v-list-item-subtitle>{{ detalle.descripcionPlatillo }}</v-list-item-subtitle>
                            </v-list-item>
                        </v-list>

                        <v-divider class="my-3"></v-divider>

                        <div class="d-flex justify-space-between align-center mt-2">
                            <div class="text-subtitle-1">Total:</div>
                            <div class="text-h6">${{ pedido.total }}</div>
                        </div>
                    </v-card-text>

                    <v-card-actions class="pa-4">
                        <v-btn color="success" variant="elevated" block :loading="processingOrders.includes(pedido.id)"
                            @click="completarPedido(pedido.id)">
                            Completar Orden
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <!-- Snackbar para notificaciones -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="top">
            {{ snackbar.text }}
        </v-snackbar>
    </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'

const runtimeConfig = useRuntimeConfig()
const socket = ref(null)
const pedidosPendientes = ref([])
const processingOrders = ref([])
const snackbar = ref({
    show: false,
    text: '',
    color: 'success'
})

// Cargar pedidos iniciales
const cargarPedidosPendientes = async () => {
    try {
        const response = await fetch(runtimeConfig.public.apiBase + '/cocina/pedidos-pendientes', {
            headers: {
                'x-api-key': runtimeConfig.public.apiKey,
                'Authorization': `Bearer ${useCookie('token').value}`
            }
        })
        const data = await response.json()
        if (data.success) {
            pedidosPendientes.value = data.data
        }
    } catch (error) {
        mostrarNotificacion('Error al cargar pedidos', 'error')
    }
}

// Conectar Socket.IO
const conectarSocket = () => {
    console.log('Intentando conectar socket...');

    const socketUrl = 'http://localhost:3004';
    console.log('Conectando a:', socketUrl);
    
    socket.value = io(socketUrl, {
        transports: ['websocket'],
        upgrade: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    socket.value.on('connect', () => {
        console.log('Socket conectado exitosamente!');
    });

    socket.value.on('connect_error', (error) => {
        console.error('Error de conexión socket:', error);
        mostrarNotificacion('Error de conexión con el servidor', 'error');
    });

    socket.value.on('nuevoPedido', (data) => {
        console.log('Nuevo pedido recibido en cliente:', data);
        if (data.success && data.data) {
            pedidosPendientes.value.unshift(data.data);
            mostrarNotificacion('Nuevo pedido recibido', 'info');
        }
    });

    socket.value.on('error', (error) => {
        console.error('Error de socket:', error);
        mostrarNotificacion(error.message || 'Error en la conexión', 'error');
    });
};

// Completar pedido
const completarPedido = async (pedidoId) => {
    processingOrders.value.push(pedidoId)
    try {
        const response = await fetch(runtimeConfig.public.apiBase + `/cocina/pedido/${pedidoId}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': runtimeConfig.public.apiKey,
                'Authorization': `Bearer ${useCookie('token').value}`
            },
            body: JSON.stringify({ estado: 2 }) // 2 = Completado
        })

        const data = await response.json()
        if (data.success) {
            mostrarNotificacion('Pedido completado exitosamente', 'success')
            const index = pedidosPendientes.value.findIndex(p => p.id === pedidoId)
            if (index !== -1) {
                pedidosPendientes.value.splice(index, 1)
            }
        }
    } catch (error) {
        mostrarNotificacion('Error al completar el pedido', 'error')
    } finally {
        processingOrders.value = processingOrders.value.filter(id => id !== pedidoId)
    }
}

const mostrarNotificacion = (text, color = 'success') => {
    snackbar.value = {
        show: true,
        text,
        color
    }
}

// Lifecycle hooks
onMounted(() => {
    cargarPedidosPendientes()
    conectarSocket()
})

onUnmounted(() => {
    if (socket.value) {
        socket.value.disconnect()
    }
})
</script>

<style scoped>
.order-card {
    transition: all 0.3s ease;
}

.order-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.1);
}

.v-list-item {
    border-radius: 8px;
}

.v-list-item:hover {
    background-color: rgba(var(--v-theme-primary), 0.1);
}
</style>