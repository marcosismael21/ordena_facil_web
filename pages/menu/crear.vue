<template>
    <v-container>
        <v-snackbar v-model="isSnackbarVisible" :color="snackbarColor" timeout="3000" location="top">
            {{ snackbarMessage }}
        </v-snackbar>
        <div>
            <v-breadcrumbs :items="itemsBread">
                <template v-slot:divider>
                    <v-icon icon="mdi-chevron-right"></v-icon>
                </template>
            </v-breadcrumbs>
        </div>
        <v-card>
            <v-card-title class="d-flex align-center justify-space-between py-2">
                <v-btn :loading="loading" prepend-icon="mdi-arrow-collapse-left" variant="tonal" @click="handleRegresar"
                    class="ma-0">
                    Regresar
                </v-btn>
                <span class="text-h6 ma-0">Crear Platillo</span>
                <div style="width: 800px"></div>
            </v-card-title>
            <v-card-text class="pt-6">
                <v-row class="d-flex align-center">
                    <v-col cols="12">
                        <v-form ref="form">
                            <v-row>
                                <v-col cols="4">
                                    <div class="text-center mb-4">
                                        <h3 class="text-h6">Detalles del Platillo</h3>
                                    </div>
                                    <v-row class="px-2">
                                        <v-col cols="12">
                                            <v-text-field v-model="formData.nombre" label="Nombre del Platillo"
                                                placeholder="Ej. Hamburgesa Doble"
                                                :rules="[rules.required, rules.nombre]" variant="outlined" required>
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field v-model="formData.descripcion" label="Descripcion"
                                                placeholder="Ej. Combo de hamburgesa doble"
                                                :rules="[rules.required, rules.descripcion]" variant="outlined"
                                                required>
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field v-model="formData.precio" label="Precio" placeholder="Ej. 150"
                                                :rules="[rules.required, rules.precio]" variant="outlined" required>
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-autocomplete v-model="formData.tipoplatilloId" :items="tipoPlatillos"
                                                label="Tipo de Platillo" placeholder="Platillo"
                                                :rules="[rules.required, rules.tipoPlatillo]" required
                                                item-title="descripcion" variant="outlined" item-value="id">
                                            </v-autocomplete>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-select v-model="formData.estado" :items="estadoOptions" label="Estado"
                                                :rules="[rules.estadoRequired]" required item-title="descripcion"
                                                variant="outlined" item-value="value">
                                            </v-select>
                                        </v-col>
                                    </v-row>
                                </v-col>
                                <v-col cols="4">
                                    <div class="text-center mb-4">
                                        <h3 class="text-h6">Productos y Cantidades</h3>
                                    </div>
                                    <div class="px-2">
                                        <div v-for="(item, index) in productosSeleccionados" :key="index" class="mb-4">
                                            <v-row align="center" no-gutters>
                                                <v-col cols="7">
                                                    <v-autocomplete v-model="item.productoId"
                                                        :items="productosFiltrados(index)" label="Producto"
                                                        item-title="descripcion" item-value="id" variant="outlined"
                                                        :rules="[rules.required, rules.producto]">
                                                    </v-autocomplete>
                                                </v-col>
                                                <v-col cols="4">
                                                    <v-text-field v-model="item.cantidad" label="Cantidad" type="number"
                                                        variant="outlined"
                                                        :rules="[rules.required, rules.cantidad]"></v-text-field>
                                                </v-col>
                                                <v-col cols="1">
                                                    <v-btn color="error" icon variant="text"
                                                        @click="removeProducto(index)"
                                                        :disabled="productosSeleccionados.length === 1">
                                                        <v-icon>mdi-delete</v-icon>
                                                    </v-btn>
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </div>

                                    <v-btn color="primary" prepend-icon="mdi-plus" variant="text" @click="addProducto"
                                        class="mt-2">
                                        Agregar Producto
                                    </v-btn>
                                </v-col>
                                <v-col cols="4">
                                    <div class="text-center mb-4">
                                        <h3 class="text-h6">Imagen del Platillo</h3>
                                    </div>
                                    <div class="px-2">
                                        <v-file-input v-model="formData.image" label="Seleccione una imagen (máx. 50MB)"
                                            show-size chips variant="outlined" accept="image/*"
                                            @update:model-value="handleImageChange" :rules="[
                                                rules.required, rules.imagen]">
                                        </v-file-input>

                                        <div class="image-container">
                                            <v-img v-if="imagePreview" :src="imagePreview" cover
                                                class="bg-grey-lighten-2" :class="{ 'image-expanded': isImageExpanded }"
                                                @click="isImageExpanded = !isImageExpanded" style="cursor: pointer"
                                                max-height="300">
                                                <template v-slot:placeholder>
                                                    <v-row class="fill-height ma-0" align="center" justify="center">
                                                        <v-progress-circular indeterminate
                                                            color="grey-lighten-5"></v-progress-circular>
                                                    </v-row>
                                                </template>
                                            </v-img>
                                            <v-img v-else height="200" class="bg-grey-lighten-2" cover>
                                                <v-row class="fill-height ma-0" align="center" justify="center">
                                                    <v-icon size="80" color="grey-lighten-1">mdi-image</v-icon>
                                                </v-row>
                                            </v-img>
                                        </div>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" @click="handleRegresar">Cancelar</v-btn>
                <v-btn color="success" variant="elevated" @click="handleCreate" :loading="loading" :disabled="loading">
                    Guardar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup>
const runtimeConfig = useRuntimeConfig()
const tokenCookie = useCookie('token')
const token = tokenCookie.value

const router = useRouter()
const loading = ref(false)
const isSnackbarVisible = ref(false)
const snackbarMessage = ref("")
const snackbarColor = ref("success")
const form = ref(null)

//variables de los v-select
const productos = ref([])
const tipoPlatillos = ref([])

//para la preview de imagen
const imagePreview = ref(null)

//para los productos y cantidades
const productosSeleccionados = ref([
    { productoId: null, cantidad: '' }
])

const formData = ref({
    image: null,
    nombre: '',
    descripcion: '',
    tipoplatilloId: '',
    precio: '',
    estado: true
})

// Primero definimos una función para limpiar el formulario
const resetForm = () => {
    formData.value = {
        image: null,
        nombre: '',
        descripcion: '',
        tipoplatilloId: '',
        precio: '',
        estado: true
    }
    imagePreview.value = null
    productosSeleccionados.value = [{ productoId: null, cantidad: '' }]
    form.value?.reset()
}

const rules = {
    required: (v) => !!v || "Este campo es requerido",
    nombre: (v) => {
        if (!v) return "El nombre es requerido"
        if (v.length < 3) return "El nombre debe tener al menos 3 caracteres"
        if (v.length > 50) return "El nombre no debe exceder los 50 caracteres"
        if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s]+$/.test(v)) return "Solo se permiten letras, números y espacios"
        return true
    },
    descripcion: (v) => {
        if (!v) return "La descripción es requerida"
        if (v.length < 5) return "La descripción debe tener al menos 5 caracteres"
        if (v.length > 200) return "La descripción no debe exceder los 200 caracteres"
        if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s.,]+$/.test(v)) return "Solo se permiten letras, números, espacios y puntos"
        return true
    },
    precio: (v) => {
        if (!v) return "El precio es requerido"
        if (v <= 0) return "El precio debe ser mayor a 0"
        if (!/^\d+(\.\d{1,2})?$/.test(v)) return "Formato inválido. Ejemplo: 150.00"
        return true
    },
    tipoPlatillo: (v) => {
        if (!v) return "Debe seleccionar un tipo de platillo"
        if (isNaN(v)) return "Tipo de platillo inválido"
        return true
    },
    producto: (v) => {
        if (!v) return "Debe seleccionar un producto"
        if (isNaN(v)) return "Producto inválido"
        return true
    },
    cantidad: (v) => {
        if (!v) return "La cantidad es requerida"
        if (v <= 0) return "La cantidad debe ser mayor a 0"
        if (!/^\d+$/.test(v)) return "Solo se permiten números enteros"
        if (v > 999) return "La cantidad no puede ser mayor a 999"
        return true
    },
    imagen: (v) => {
        if (!v) return "Debe seleccionar una imagen"
        //const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        //if (!allowedTypes.includes(v.type)) return "Solo se permiten imágenes en formato JPG, PNG o WEBP"
        return true
    },
    estado: (v) => v !== undefined || "Debe seleccionar un estado",
}

//funcion para manejar el cambio de imagen
const handleImageChange = (file) => {
    if (file) {
        if (file.size > 25 * 1024 * 1024) {
            snackbarColor.value = "error";
            snackbarMessage.value = "La imagen no debe exceder los 25MB";
            isSnackbarVisible.value = true;
            formData.value.image = null;
            return;
        }

        imagePreview.value = URL.createObjectURL(file);
    } else {
        imagePreview.value = null;
    }
}

//funcion para manejar productos y cantidades
const addProducto = () => {
    productosSeleccionados.value.push({ productoId: null, cantidad: '' })
}

const removeProducto = (index) => {
    productosSeleccionados.value.splice(index, 1)
}

//filtrar productos ya seleccionados
const productosFiltrados = (currentIndex) => {
    const productosIds = productosSeleccionados.value
        .map((item, index) => index !== currentIndex ? item.productoId : null)
        .filter(id => id !== null)

    return productos.value.filter(p => !productosIds.includes(p.id))
}

const itemsBread = ref([
    {
        title: "Inicio",
        disabled: false,
    },
    {
        title: "Menú de platillos",
        disabled: false,
        href: "/menu",
    },
    {
        title: "Crear",
        disabled: false,
    },
])

const estadoOptions = [
    { descripcion: "Activo", value: true },
    { descripcion: "Inactivo", value: false },
]

const getDataSelect = async () => {
    try {

        const getProducto = await $fetch(runtimeConfig.public.apiBase + "/producto", {
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

        productos.value = getProducto.data
        tipoPlatillos.value = getTipoPlatillo.data
    } catch (error) {
        console.error('Error fetching data:', error)
    }
}

const filtrarElementosActivos = (array) => array.filter(element => element.estado !== false)

const dataRefs = {
    productos,
    tipoPlatillos,
}

Object.entries(dataRefs).forEach(([key, ref]) => {
    watch(ref, (nuevos, viejos) => {
        if (viejos.length === 0) {
            ref.value = filtrarElementosActivos(nuevos)
        }
    })
})

await getDataSelect()

const handleCreate = async () => {
    const { valid } = await form.value?.validate()

    if (!valid) {
        snackbarColor.value = "error"
        snackbarMessage.value = "Por favor, complete correctamente todos los campos"
        isSnackbarVisible.value = true
        return
    }

    loading.value = true

    try {
        // Crear FormData y agregar los campos
        const formDataToSend = new FormData()

        // Agregar la imagen si existe
        if (formData.value.image) {
            formDataToSend.append('image', formData.value.image)
        }

        // Convertir los arrays antes de enviarlos
        const productoIds = productosSeleccionados.value.map(p => p.productoId);
        const cantidades = productosSeleccionados.value.map(p => Number(p.cantidad));

        // Agregar el resto de campos
        formDataToSend.append('nombre', formData.value.nombre);
        formDataToSend.append('descripcion', formData.value.descripcion);
        formDataToSend.append('tipoplatilloId', formData.value.tipoplatilloId);
        formDataToSend.append('precio', formData.value.precio);
        formDataToSend.append('estado', formData.value.estado);
        formDataToSend.append('productoIds', JSON.stringify(productoIds));
        formDataToSend.append('cantidad', JSON.stringify(cantidades));

        const response = await $fetch(runtimeConfig.public.apiBase + "/platillo", {
            method: "POST",
            headers: {
                "x-api-key": runtimeConfig.public.apiKey,
                "Authorization": `Bearer ${token}`,
                // No incluir Content-Type, FormData lo establece automáticamente
            },
            body: formDataToSend
        });

        if (response.success) {
            snackbarColor.value = "success";
            snackbarMessage.value = "Platillo creado exitosamente";
            isSnackbarVisible.value = true;
            resetForm();
        } else {
            throw new Error(response.message);
        }
    } catch (e) {
        console.error('Error completo:', e);
        snackbarColor.value = "error";
        snackbarMessage.value = e.message || "Error al crear el platillo";
        isSnackbarVisible.value = true;
    } finally {
        loading.value = false;
    }
};
const handleRegresar = () => {
    router.push("/menu")
}

</script>


<style scoped>
.image-container {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 4px;
}

.image-expanded {
    position: relative;
    z-index: 1000;
    transform-origin: center;
    transition: all 0.3s ease;
}

.image-expanded:hover {
    transform: scale(1.05);
}

.v-col {
    display: flex;
    flex-direction: column;
}

.px-2 {
    height: 100%;
}
</style>