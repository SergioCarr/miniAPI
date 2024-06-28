const express = require('express')
const router = express.Router();
const db = require("../../databases/db");
const { MongoNetworkError } = require('mongodb');

router.get("/hola",(req,res)=>{
        res.send("Bienvenido a la ClimAPI")
    })
router.get("/newData/:temp/:humid/:wndSpd/:wndDir/:press/:snRd/:precType/:precAmnt/:coord",async (req,res)=>{
        const {temp,humid,wndSpd,wndDir,press,snRd,precType,precAmnt,coord} = req.params
        const resultados = await db.query("insert",{temperatura:+temp,humedad:+humid,viento:{
            velocidad:+wndSpd,
            direccion:wndDir
        },presion:+press,radiacion: +snRd,precipitacion:{
            tipo: precType,
            cantidad: +precAmnt
        },coordenada:decodeURI(coord),fecha: new Date()})
        res.send(resultados)
    })

router.get("/updateByCoord/:coord/:atributo/:valor",async (req,res)=>{
        const {coord,atributo,valor} = req.params
        const numericos = ["temperatura","humedad","viento.velocidad","presion","radiacion","precipitacion.cantidad"]
        const stringuicos = ["viento.direccion","precipitacion.tipo"]
        let obj = {}
        if (numericos.includes(atributo)){
            obj[atributo] = +valor
            const resultado = await db.query("update",{coordenada:decodeURI(coord)},{$set:obj})
            console.log(resultado)
            if(resultado.modifiedCount>0){
                res.send("Informacion actualizada correctamente")
            }else{
                res.send("No se encontro una entrada de datos con esa coordenada")
            }
        }else if (stringuicos.includes(atributo)){
            obj[atributo] = valor
            const resultado = await db.query("update",{coordenada:decodeURI(coord)},{$set:obj})
            console.log(resultado)
            if(resultado.modifiedCount>0){
                res.send("Informacion actualizada correctamente")
            }else{
                res.send("No se encontro una entrada de datos con esa coordenada")
            }
        }else{
            res.send("No puedo actualizar un atributo que no existe")
        }
    })

router.get("eraseData/:coord",async (req,res)=>{
    const {coord} = req.params
    const resultado = await db.query("delete",{coordenada:decodeURI(coord)})
    if(resultado.deletedCount>0){
        res.send("Se borro el dato correctamente")
    }else{
        res.send("No existe un dato con esa coordenada")
    }
})

router.get("/readAll/:orden", async(req,res)=>{
    const {orden} = req.params
    if(orden=="asc"){
        const resultado = await db.query("aggregation",[{$sort:{fecha:1}}])
        res.send(resultado)
    }else if(orden=="desc"){
        const resultado = await db.query("aggregation",[{$sort:{fecha:-1}}])
        res.send(resultado)
    }else{
        res.send("Orden no valido")
    }
})

router.get("/readOne/:coord", async(req,res)=>{
    const {coord} = req.params
    res.send(await db.query("find",{coordenada:decodeURI(coord)}))
})

    module.exports = router
