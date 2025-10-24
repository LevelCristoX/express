const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

app.set('view engine', 'ejs');
const admin = require('firebase-admin');
const cors = require('cors');
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const serviceAccount = require('./firebase_key.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

app.get('/productos', async (req, res) => {
    try {
        const items = await db.collection('productos').get();
        const productos = items.docs.map(doc =>{
            const data = doc.data();
            return {
                id: doc.id,
                nombre: data.nombre,
                precio: data.precio,
                descripcion: data.descripcion,
                imagen: data.imagen,
                marca: data.marca
            };
        });
        res.render('INICIO',{productos});
    } catch (error) {
        res.status(500).json( {error: error.message} );
    }
});

app.get('/productos/add', (req, res) => {
    res.render('form', { producto: null , nombre: 'Crear Producto'});
});

app.post('/productos', async (req, res) => {
    try {
        const { nombre, precio, descripcion, imagen, marca } = req.body;
        const newProducto = {
            nombre: nombre || '',
            precio: precio || 0,
            descripcion: descripcion || '',
            imagen: imagen || '',
            marca: marca || ''
        };
        await db.collection('productos').add(newProducto);
        res.redirect('/productos');
    } catch (err) {
        res.status(500).json({ error: "Error al crear producto" });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
