<template>
  <v-container fluid class="pa-2" style="height: calc(100vh - 48px)">
    <v-row no-gutters class="fill-height">
      <!-- Sección 1: Pedidos Pendientes -->
      <v-col cols="2" class="border-r section-height px-2 bg-section-background">
        <div class="d-flex flex-column h-100">
          <div class="px-4 pt-4">
            <h2 class="text-h6 mb-2">Pedidos Pendientes</h2>
            <v-text-field v-model="searchPending" prepend-inner-icon="mdi-magnify" label="Buscar pedido" single-line
              variant="outlined" hide-details density="compact" class="mb-2">
            </v-text-field>
          </div>

          <div class="flex-grow-1 overflow-y-auto px-2">
            <v-card v-for="pedido in filteredPendingOrders" :key="pedido.id" class="mb-2" elevation="2" hover
              @click="selectPendingOrder(pedido)" density="compact">
              <v-card-item>
                <v-card-title class="text-subtitle-2">#{{ pedido.numeroOrden }}</v-card-title>
                <v-card-subtitle class="text-caption">Cliente: {{ pedido.nombreCliente }}</v-card-subtitle>
                <v-card-subtitle class="text-caption">DNI: {{ pedido.dni || 'N/A' }}</v-card-subtitle>
                <div class="text-caption d-flex justify-space-between">
                  <span>Total:</span>
                  <span>${{ pedido.total }}</span>
                </div>
                <div class="text-caption mt-1">
                  <v-chip size="x-small" color="warning" class="ml-2">
                    Pendiente
                  </v-chip>
                </div>
              </v-card-item>
            </v-card>
          </div>
        </div>
      </v-col>

      <!-- Sección 2: Lista de Platillos (más ancha) -->
      <v-col cols="7" class="px-2 section-height">
        <div class="d-flex flex-column h-100">
          <div class="px-4 pt-4 section-header">
            <div class="d-flex align-center mb-2">
              <h2 class="text-h6">Menú</h2>
              <v-spacer></v-spacer>
              <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Buscar platillo" single-line
                variant="outlined" hide-details density="compact" style="max-width: 300px"></v-text-field>
            </div>
            <v-row no-gutters class="mb-2">
              <v-col v-for="tipo in tipoPlatillos" :key="tipo.id" :cols="12" :sm="6"
                :md="Math.max(3, Math.floor(12 / tipoPlatillos.length))" class="pa-1">
                <v-btn block :color="selectedTipoPlatillo === tipo.id ? 'primary' : undefined"
                  :variant="selectedTipoPlatillo === tipo.id ? 'flat' : 'outlined'" @click="toggleFilter(tipo.id)"
                  class="text-none" height="42">
                  {{ tipo.descripcion }}
                </v-btn>
              </v-col>
            </v-row>
          </div>

          <div class="flex-grow-1 overflow-y-auto px-2 ">
            <v-row>
              <v-col v-for="item in filteredItems" :key="item.id" cols="12" sm="6">
                <v-card @click="addToOrder(item)" class="h-100" elevation="2" hover>
                  <v-img :src="item.imageUrl" height="250" cover class="align-end">
                    <v-card-title class="text-white bg-black bg-opacity-50 px-4 py-2">
                      {{ item.nombre }}
                    </v-card-title>
                  </v-img>
                  <v-card-text>
                    <div class="text-caption mb-1">{{ item.descripcion }}</div>
                    <div class="text-h6 font-weight-bold">${{ item.precio }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-col>

      <!-- Sección 3: Resumen de Orden -->
      <v-col cols="3" class="px-4 bg-section-background section-height">
        <div class="d-flex flex-column h-100">
          <div class="px-2 pt-4">
            <div class="d-flex align-center mb-4">
              <h2 class="text-h6">Orden Actual</h2>
              <v-spacer></v-spacer>
              <v-btn density="compact" variant="text" icon="mdi-account-plus"
                @click="dialogNuevoCliente = true"></v-btn>
            </div>

            <div class="d-flex flex-column gap-2 mb-4 px-2">
              <div>
                <div class="text-subtitle-2 mb-1">Cliente</div>
                <v-autocomplete v-model="formData.clienteId" :items="clientes" item-title="nombres" item-value="id"
                  placeholder="Seleccionar cliente" density="compact" hide-details class="mb-2"
                  :search-input.sync="searchCliente" :filter="filterClientes" @update:search="searchCliente = $event"
                  bg-color="transparent">
                  <template v-slot:prepend-inner>
                    <v-icon size="small">mdi-account</v-icon>
                  </template>
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <v-list-item-subtitle>DNI: {{ item.raw.dni }}</v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-autocomplete>
                <div>
                  <div class="text-subtitle-2 mb-1">Tipo de Pedido</div>
                  <v-select v-model="formData.tipoPedidoId" :items="tPedidos" item-title="descripcion" item-value="id"
                    placeholder="Tipo" density="compact" hide-details bg-color="transparent">
                  </v-select>
                </div>
              </div>
            </div>
          </div>

          <div class="flex-grow-1 overflow-y-auto section-content px-2">
            <v-list density="compact">
              <v-list-item v-for="(item, index) in orderItems" :key="index" class="mb-2">
                <template v-slot:prepend>
                  <v-btn icon="mdi-delete" variant="text" density="compact" color="error"
                    @click="removeFromOrder(index)"></v-btn>
                </template>
                <v-list-item-title class="text-subtitle-2">
                  {{ item.nombre }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  <div class="d-flex justify-space-between align-center mt-1">
                    <span>${{ item.precio }}</span>
                    <div class="d-flex align-center">
                      <v-btn icon="mdi-minus" variant="text" density="compact" :disabled="item.quantity <= 1"
                        @click="decrementQuantity(index)"></v-btn>
                      <span class="mx-2">{{ item.quantity }}</span>
                      <v-btn icon="mdi-plus" variant="text" density="compact" @click="incrementQuantity(index)"></v-btn>
                    </div>
                    <span>${{ item.precio * item.quantity }}</span>
                  </div>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>

          <div class="px-4 pb-4">
            <v-card flat class="bg-transparent">
              <v-card-text class="py-2">
                <div class="d-flex justify-space-between mb-1">
                  <span>Subtotal:</span>
                  <span>${{ subtotal }}</span>
                </div>
                <div class="d-flex justify-space-between mb-1">
                  <span>Descuento:</span>
                  <span>${{ discount }}</span>
                </div>
                <div class="d-flex justify-space-between text-h6">
                  <span>Total:</span>
                  <span>${{ total }}</span>
                </div>
              </v-card-text>
              <v-card-actions class="pa-0">
                <v-btn block color="success" size="large" @click="sendToKitchen">
                  {{ isExistingOrder ? 'Enviar a Cocina' : 'Crear Pedido' }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-dialog v-model="dialogNuevoCliente" max-width="500px">
      <v-card>
        <v-card-title>Nuevo Cliente</v-card-title>
        <v-card-text>
          <v-form ref="formNewClient" @submit.prevent="handleCreateClient">
            <v-row>
              <v-col cols="6">
                <v-text-field v-model="nuevoCliente.nombres" label="Nombre completo" placeholder="Ej. Marvin Ponce"
                  :rules="[
                    v => !!v || 'El nombre es requerido',
                    v => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v) || 'Solo se permiten letras',
                    v => v?.length >= 3 || 'El nombre debe tener al menos 3 caracteres'
                  ]" variant="outlined">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="nuevoCliente.dni" placeholder="Ej. 10101190012345" label="N° de identidad"
                  :rules="[
                    v => !!v || 'El número de identidad es requerido',
                    v => /^\d+$/.test(v) || 'Solo se permiten números',
                    v => v?.length >= 13 || 'El número debe tener 13 dígitos',
                    v => v?.length <= 13 || 'El número debe tener 13 dígitos'
                  ]" variant="outlined">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="nuevoCliente.telefono" placeholder="Ej. 99999999" label="Teléfono" :rules="[
                  v => !!v || 'El teléfono es requerido',
                  v => /^\d+$/.test(v) || 'Solo se permiten números',
                  v => v?.length >= 8 || 'El teléfono debe tener al menos 8 dígitos',
                  v => v?.length <= 8 || 'El teléfono debe tener 8 dígitos'
                ]" variant="outlined">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="nuevoCliente.correo" placeholder="Ej. user@example.es" label="Correo electrónico"
                  :rules="[
                    v => !!v || 'El correo es requerido',
                    v => /.+@.+\..+/.test(v) || 'Ingrese un correo válido',
                    v => v?.length <= 50 || 'El correo no debe exceder 50 caracteres'
                  ]" variant="outlined">
                </v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="dialogNuevoCliente = false">Cancelar</v-btn>
          <v-btn color="primary" @click="handleCreateClient">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="isSnackbarVisible" :color="snackbarColor" timeout="3000" location="top">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { io } from 'socket.io-client'

const runtimeConfig = useRuntimeConfig()
const tokenCookie = useCookie('token')
const colaboradorIdCookie = useCookie('colaboradorId')
const token = tokenCookie.value
const colaboradorId = colaboradorIdCookie.value

const search = ref('')
const searchPending = ref('')
const searchCliente = ref('')
const datos = ref([])
const tPedidos = ref([])
const pedidosPendientes = ref([])
const error = ref()
const isSnackbarVisible = ref(false)
const snackbarMessage = ref("")
const snackbarColor = ref("success")
const dialogNuevoCliente = ref(false)
const formNewClient = ref(null)
const clientes = ref([])
const tipoPlatillos = ref([])
const selectedTipoPlatillo = ref(null)
const isExistingOrder = ref(false)
const currentOrderId = ref(null)

const orderItems = ref([])
const discount = ref(0)

const socket = ref(null)

const formData = ref({
  //valores de pedido
  clienteId: 1,
  colaboradorId: colaboradorId,
  tipoPedidoId: 1,
  direccionId: null,
  descuentoPedido: 0,
  //valores de pedido detalle
  platilloIds: [],
  cantidadPedidoDetalles: [],
  precioUnitarioPedidoDetalles: [],
  contExtras: [],
  //valores de extra
  productoIds: [],
  cantidadExtras: [],
  precioUnitarioExtras: []
})

const nuevoCliente = ref({
  nombres: '',
  correo: '',
  dni: '',
  telefono: '',
  estado: 1
})

const resetForm = () => {
  formData.value = {
    clienteId: 1,
    colaboradorId: colaboradorId,
    tipoPedidoId: 1,
    direccionId: null,
    descuentoPedido: 0,
    platilloIds: [],
    cantidadPedidoDetalles: [],
    precioUnitarioPedidoDetalles: [],
    contExtras: [],
    productoIds: [],
    cantidadExtras: [],
    precioUnitarioExtras: []
  }
  orderItems.value = []
  discount.value = 0
  isExistingOrder.value = false
  currentOrderId.value = null
}

const resetFormCliente = () => {
  nuevoCliente.value = {
    nombres: '',
    correo: '',
    dni: '',
    telefono: '',
    estado: 1
  }
}

// Filter items based on search
const filteredItems = computed(() => {
  let items = datos.value

  if (selectedTipoPlatillo.value) {
    items = items.filter(item => item.tipoPlatilloId === selectedTipoPlatillo.value)
  }

  if (search.value) {
    items = items.filter(item =>
      item.nombre.toLowerCase().includes(search.value.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(search.value.toLowerCase())
    )
  }

  return items
})

const toggleFilter = (tipoPlatilloId) => {
  if (selectedTipoPlatillo.value === tipoPlatilloId) {
    selectedTipoPlatillo.value = null
  } else {
    selectedTipoPlatillo.value = tipoPlatilloId
  }
}

// Calculate totals
const subtotal = computed(() => {
  return orderItems.value.reduce((acc, item) =>
    acc + (parseFloat(item.precio) * item.quantity), 0
  )
})

const total = computed(() => {
  return subtotal.value - discount.value
})

const filteredPendingOrders = computed(() => {
  if (!searchPending.value) return pedidosPendientes.value

  const searchTerm = searchPending.value.toLowerCase().trim()
  return pedidosPendientes.value.filter(pedido => {
    return (
      pedido.numeroOrden.toLowerCase().includes(searchTerm) ||
      pedido.nombreCliente.toLowerCase().includes(searchTerm) ||
      pedido.dni.toLowerCase().includes(searchTerm)
    )
  })
})

const filterClientes = (item, query) => {
  if (!query) return true

  const searchTerm = query.toLowerCase().trim()
  return (
    item.nombres.toLowerCase().includes(searchTerm) ||
    item.dni.toLowerCase().includes(searchTerm)
  )
}

const selectPendingOrder = async (pedido) => {
  try {
    snackbarColor.value = "info"
    snackbarMessage.value = `Cargando detalles de la orden #${pedido.numeroOrden}...`
    isSnackbarVisible.value = true

    orderItems.value = []

    const response = await $fetch(runtimeConfig.public.apiBase + `/pedido/detalle/${pedido.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      }
    })

    if (response.success && response.data && response.data.length > 0) {
      const orderDetail = response.data[0]

      formData.value.clienteId = orderDetail.clienteId

      formData.value.tipoPedidoId = orderDetail.tipoPedidoId

      if (orderDetail.direccionId) {
        formData.value.direccionId = orderDetail.direccionId
      }

      discount.value = parseFloat(orderDetail.descuento) || 0
      formData.value.descuentoPedido = discount.value

      formData.value.platilloIds = []
      formData.value.cantidadPedidoDetalles = []
      formData.value.precioUnitarioPedidoDetalles = []
      formData.value.contExtras = []

      const platilloIds = orderDetail.platilloIds.split(',')
      const platilloNombres = orderDetail.platilloNombres.split(',')
      const cantidades = orderDetail.cantidades.split(',')
      const preciosUnitarios = orderDetail.preciosUnitarios.split(',')
      const subtotalesDetalle = orderDetail.subtotalesDetalle.split(',')
      const contieneExtras = orderDetail.contieneExtras ? orderDetail.contieneExtras.split(',') : []

      for (let i = 0; i < platilloIds.length; i++) {
        formData.value.platilloIds.push(parseInt(platilloIds[i]))
        formData.value.cantidadPedidoDetalles.push(parseInt(cantidades[i]))
        formData.value.precioUnitarioPedidoDetalles.push(parseFloat(preciosUnitarios[i]))
        formData.value.contExtras.push(contieneExtras[i] === "1" ? 1 : 0)

        orderItems.value.push({
          id: parseInt(platilloIds[i]),
          nombre: platilloNombres[i],
          precio: parseFloat(preciosUnitarios[i]),
          quantity: parseInt(cantidades[i])
        })
      }

      isExistingOrder.value = true
      currentOrderId.value = pedido.id

      snackbarColor.value = "success"
      snackbarMessage.value = `Orden #${pedido.numeroOrden} cargada correctamente`
      isSnackbarVisible.value = true
    } else {
      throw new Error(response.message || "No se pudieron cargar los detalles del pedido")
    }
  } catch (error) {
    console.error("Error al cargar los detalles del pedido:", error)
    snackbarColor.value = "error"
    snackbarMessage.value = error.data.message || "Error al cargar los detalles del pedido"
    isSnackbarVisible.value = true
  }
}

const addToOrder = (item) => {
  const existingItem = orderItems.value.find(i => i.id === item.id)
  if (existingItem) {
    existingItem.quantity++
    // Encontrar el índice del item existente
    const index = formData.value.platilloIds.indexOf(item.id)
    if (index !== -1) {
      formData.value.cantidadPedidoDetalles[index]++
    }
  } else {
    orderItems.value.push({
      ...item,
      quantity: 1
    })
    // Agregar nuevo item al formData
    formData.value.platilloIds.push(item.id)
    formData.value.cantidadPedidoDetalles.push(1)
    formData.value.precioUnitarioPedidoDetalles.push(parseFloat(item.precio))
    formData.value.contExtras.push(0) // Por ahora sin extras
  }
}

const handleCreate = async () => {
  if (orderItems.value.length === 0) {
    snackbarColor.value = "error"
    snackbarMessage.value = "Debe agregar al menos un platillo a la orden"
    isSnackbarVisible.value = true
    return
  }

  if (!formData.value.tipoPedidoId) {
    snackbarColor.value = "error"
    snackbarMessage.value = "Debe seleccionar un tipo de pedido"
    isSnackbarVisible.value = true
    return
  }

  if (!formData.value.clienteId) {
    snackbarColor.value = "error"
    snackbarMessage.value = "Debe seleccionar un cliente"
    isSnackbarVisible.value = true
    return
  }

  try {
    // Actualizar el descuento antes de enviar
    formData.value.descuentoPedido = discount.value

    const response = await $fetch(runtimeConfig.public.apiBase + "/pedido", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      },
      body: formData.value
    })

    if (response.success) {
      snackbarColor.value = "success"
      snackbarMessage.value = "Pedido creado exitosamente"
      isSnackbarVisible.value = true
      resetForm()
      await refreshPendingOrders()
    } else {
      throw new Error(response.message)
    }
  } catch (e) {
    snackbarColor.value = "error"
    snackbarMessage.value = e.data.message || "Error al crear el pedido"
    isSnackbarVisible.value = true
  }
}

const handleCreateClient = async () => {
  const { valid } = await formNewClient.value?.validate()

  if (!valid) return

  try {
    const response = await $fetch(runtimeConfig.public.apiBase + "/cliente/caja", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      },
      body: nuevoCliente.value
    })

    if (response.success) {
      snackbarColor.value = "success"
      snackbarMessage.value = "Cliente creado exitosamente"
      isSnackbarVisible.value = true
      dialogNuevoCliente.value = false
      await getClientes()
      formData.value.clienteId = response.data.id
      resetFormCliente()
    }
  } catch (e) {
    snackbarColor.value = "error"
    snackbarMessage.value = e.data.message || "Error al crear el cliente"
    isSnackbarVisible.value = true
  }
}

const sendToKitchen = async () => {
  //handleCreate()
  if (orderItems.value.length === 0) {
    snackbarColor.value = "error"
    snackbarMessage.value = "Debe agregar al menos un platillo a la orden"
    isSnackbarVisible.value = true
    return
  }

  if (!formData.value.tipoPedidoId) {
    snackbarColor.value = "error"
    snackbarMessage.value = "Debe seleccionar un tipo de pedido"
    isSnackbarVisible.value = true
    return
  }

  if (!formData.value.clienteId) {
    snackbarColor.value = "error"
    snackbarMessage.value = "Debe seleccionar un cliente"
    isSnackbarVisible.value = true
    return
  }

  try {
    formData.value.descuentoPedido = discount.value

    let url = runtimeConfig.public.apiBase + "/pedido"
    let method = "POST"

    if (isExistingOrder.value && currentOrderId.value) {
      url = runtimeConfig.public.apiBase + `/pedido/${currentOrderId.value}/enviar-cocina`
      method = "PUT"
    }

    const response = await $fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      },
      body: formData.value
    })

    if (response.success) {
      snackbarColor.value = "success"
      snackbarMessage.value = isExistingOrder.value
        ? "Pedido enviado a cocina exitosamente"
        : "Pedido creado exitosamente"
      isSnackbarVisible.value = true

      resetForm()
      isExistingOrder.value = false
      currentOrderId.value = null

      await refreshPendingOrders()
    } else {
      throw new Error(response.message)
    }
  } catch (e) {
    snackbarColor.value = "error"
    snackbarMessage.value = e.data?.message || e.message || "Error al procesar el pedido"
    isSnackbarVisible.value = true
  }
}

const incrementQuantity = (index) => {
  orderItems.value[index].quantity++
  const itemId = orderItems.value[index].id
  const formIndex = formData.value.platilloIds.indexOf(itemId)
  if (formIndex !== -1) {
    formData.value.cantidadPedidoDetalles[formIndex]++
  }
}

const decrementQuantity = (index) => {
  if (orderItems.value[index].quantity > 1) {
    orderItems.value[index].quantity--
    const itemId = orderItems.value[index].id
    const formIndex = formData.value.platilloIds.indexOf(itemId)
    if (formIndex !== -1) {
      formData.value.cantidadPedidoDetalles[formIndex]--
    }
  }
}

const removeFromOrder = (index) => {
  // Obtener el ID del platillo antes de eliminarlo
  const itemId = orderItems.value[index].id

  // Encontrar el índice en formData
  const formIndex = formData.value.platilloIds.indexOf(itemId)

  // Eliminar el item de orderItems
  orderItems.value.splice(index, 1)

  // Eliminar los datos correspondientes de formData
  if (formIndex !== -1) {
    formData.value.platilloIds.splice(formIndex, 1)
    formData.value.cantidadPedidoDetalles.splice(formIndex, 1)
    formData.value.precioUnitarioPedidoDetalles.splice(formIndex, 1)
    formData.value.contExtras.splice(formIndex, 1)
  }
}

const getData = async () => {
  try {
    const response = await $fetch(runtimeConfig.public.apiBase + "/platillo", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      }
    })

    if (response.success) {
      datos.value = response.data.map((item, index) => ({
        ...item,
        nro: index + 1
      }))
    } else {
      throw new Error(response.message)
    }

  } catch (e) {
    error.value = e
    snackbarColor.value = "error"
    snackbarMessage.value = e.data.message || "Error al cargar los datos"
    isSnackbarVisible.value = true
  }
}

const getDataSelect = async () => {
  try {
    const getTipoPedido = await $fetch(runtimeConfig.public.apiBase + "/tipoPedido", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      }
    })

    const getPedidoPendiente = await $fetch(runtimeConfig.public.apiBase + "/cocina/pedidos-pendientes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      }
    })

    const getTipoPlatillo = await $fetch(runtimeConfig.public.apiBase + "/tipoPlatillo", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      }
    })

    tPedidos.value = getTipoPedido.data
    tipoPlatillos.value = getTipoPlatillo.data
    pedidosPendientes.value = getPedidoPendiente.data

    if (tipoPlatillos.value && tipoPlatillos.value.length > 0) {
      selectedTipoPlatillo.value = tipoPlatillos.value[0].id
    }
  } catch (e) {
    error.value = e
    snackbarColor.value = "error"
    snackbarMessage.value = e.data.message || "Error al cargar los datos"
    isSnackbarVisible.value = true

  }
}

const filtrarElementosActivos = (array) => array.filter(element => element.estado !== false)

const dataRefs = {
  tPedidos,
  clientes,
  tipoPlatillos,
}

Object.entries(dataRefs).forEach(([key, ref]) => {
  watch(ref, (nuevos) => {
    if (nuevos && Array.isArray(nuevos)) {
      setTimeout(() => {
        ref.value = nuevos.filter(element =>
          element && typeof element.estado !== 'undefined' && element.estado !== false
        )
      }, 0)
    }
  }, { deep: true })
})

const conectarSocket = () => {
  console.log('Intentando conectar socket para caja...')

  const socketUrl = 'http://localhost:3004'
  console.log('Conectando a:', socketUrl)

  socket.value = io(socketUrl, {
    transports: ['websocket'],
    upgrade: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  })

  socket.value.on('connect', () => {
    console.log('Socket conectado exitosamente!');
  })

  socket.value.on('connect_error', (error) => {
    console.error('Error de conexión socket:', error);
    snackbarColor.value = "error";
    snackbarMessage.value = "Error de conexión con el servidor";
    isSnackbarVisible.value = true;
  })

  socket.value.on('nuevoPedido', (data) => {
    console.log('Nuevo pedido recibido en cliente caja:', data);
    if (data.success && data.data) {
      // Actualizar la lista de pedidos pendientes
      refreshPendingOrders();
      snackbarColor.value = "info";
      snackbarMessage.value = "Nuevo pedido recibido";
      isSnackbarVisible.value = true;
    }
  })

  socket.value.on('error', (error) => {
    console.error('Error de socket:', error)
    snackbarColor.value = "error"
    snackbarMessage.value = error.data.message || 'Error en la conexión'
    isSnackbarVisible.value = true
  })
}

const refreshPendingOrders = async () => {
  try {
    const response = await $fetch(runtimeConfig.public.apiBase + "/cocina/pedidos-pendientes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      }
    });

    if (response.success) {
      pedidosPendientes.value = response.data;
    } else {
      throw new Error(response.message);
    }
  } catch (e) {
    console.error('Error al actualizar pedidos pendientes:', e);
    snackbarColor.value = "error";
    snackbarMessage.value = "Error al cargar pedidos pendientes";
    isSnackbarVisible.value = true;
  }
}

const getClientes = async () => {
  try {
    const response = await $fetch(runtimeConfig.public.apiBase + "/cliente", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      }
    })

    if (response.success) {
      clientes.value = response.data
    }
  } catch (e) {
    snackbarColor.value = "error"
    snackbarMessage.value = "Error al cargar los clientes"
    isSnackbarVisible.value = true
  }
}

await getDataSelect()

onMounted(() => {
  getData()
  getClientes()
  conectarSocket()
})

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect();
  }
})
</script>

<style scoped>
.section-height {
  height: calc(100vh - 48px) !important;
  max-height: calc(100vh - 48px) !important;
  overflow: hidden;
  padding: 0 12px !important;
}

.section-header {
  position: sticky;
  top: 0;
  background-color: rgb(var(--v-theme-surface));
  z-index: 1;
  padding: 16px !important;
  margin: 0 -12px;
}

.section-content {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 0;
}

.section-content .v-row {
  margin: 0 -8px;
}

.section-content .v-col {
  padding: 8px;
}

.section-content::-webkit-scrollbar {
  width: 8px;
}

.section-content::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-surface-variant), 0.1);
}

.section-content::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 4px;
}

.section-content::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}

.v-card {
  margin-bottom: 12px;
}
</style>