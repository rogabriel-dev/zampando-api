CREATE DATABASE  IF NOT EXISTS `zampando` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `zampando`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: zampando
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menus` (
  `id_menu` int NOT NULL AUTO_INCREMENT,
  `nombre_menu` varchar(50) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `descripcion` varchar(1000) DEFAULT NULL,
  `calorias` int NOT NULL,
  `id_dieta` int NOT NULL,
  `id_plato` int NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_menu`),
  UNIQUE KEY `id_menu` (`id_menu`),
  KEY `id_dieta` (`id_dieta`),
  KEY `id_plato` (`id_plato`),
  CONSTRAINT `menus_ibfk_1` FOREIGN KEY (`id_dieta`) REFERENCES `tipo_dieta` (`id_dieta`),
  CONSTRAINT `menus_ibfk_2` FOREIGN KEY (`id_plato`) REFERENCES `tipo_plato` (`id_plato`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES (1,'Ensalada Quinoa',4.50,'Creamos nuestra ensalada de quinoa usando los mejores ingredientes, mezclando aceitunas, tomates cherry, aguacate, zanahoria y maíz, y un aliño sencillo con nuestro mejor aceite y jugo de limón.',300,1,1,'quinoa.jpg'),(2,'Lasaña Florentina',9.00,'Hacemos un ragout con pavo y zanahoria y, para aportar sabor y melosidad, saborizamos con salvia. Aparte, cocinamos espinacas a las que le agregamos bechamel para potenciar la cremosidad. Intercalamos capas de ragout, pasta de lasagna y espinacas con bechamel. Por último, incorporamos bechamel, queso parmesano y gratinamos.',804,2,3,'lasagna-florentina.jpg'),(3,'Brownie vegano',3.10,'Fundimos el chocolate e incorporamos el cacao, la harina y el azúcar. Agregamos la leche de soja. Por último incorporamos las avellanas tostadas y horneamos.',705,1,3,'brownie-vegano.jpg'),(4,'Guiso de calamar y patata',4.50,'Para la base de este guiso comenzamos sofriendo pimiento verde junto con cebolla y ajo, incorporamos pasta de tomate y pimentón, mojamos con vino blanco y cocinamos con nuestro fumet casero. Cocinamos el calamar asegurándonos que quede tierno. Para rematar el plato acompañamos con patatas al vapor.',450,3,2,'guiso-calamar-patata.jpg'),(5,'Albóndigas Suecas',6.69,'Partimos haciendo una salsa con caldo reducido de ternera, nata y salsa Perrins en la que guisamos nuestras albóndigas de vacuno 100% artesanales. Para acompañar nada mejor que crema de patata.',820,3,2,'albondigas-suecas.jpg'),(6,'Crema de verduras',3.00,'Seleccionamos verduras en su mejor temporada, las salteamos brevemente con aceite de oliva y las cocemos hasta su punto óptimo, después las trituramos y las corregimos de sal. Keeping it simple.',216,1,1,'crema-de-verduras.jpg'),(7,'Lasagna alla Bolognese',6.69,'Intercalamos capas de nuestra bolognesa cocinada 6 horas a fuego lento y pasta fresca. Terminamos el plato con una bechamel intensa y aterciopelada, integrada a mano y con varilla. Gratinamos con parmigiano reggiano y servimos.',796,3,2,'lasagna-alla-bolognese.jpg'),(8,'Flan de queso con caramelo',3.10,'Infusionamos leche con queso crema e incorporamos leche condensada para aportar untuosidad. Agregamos una pizca de queso parmesano, que por su umami natural, potencia todos los sabores. Cocinamos los flanes en baño maría para aseguraros una textura perfecta. Hacemos un café ligero con el que mojamos un caramelo rubio.',379,2,3,'flan-de-queso-con-caramelo-cafe.jpg'),(13,'Pasta al pesto',6.69,'Esta versión de este clásico genovés mantiene la albahaca, los piñones, el zumo de limón el aceite de oliva y la sal. Hemos reemplazado el Parmigiano Reggiano por Tofu y para lograr el umami hemos incorporado un poco de salsa de soja.',231,1,2,'pasta-pesto.jpg');
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id_pedido` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `fecha_pedido` datetime NOT NULL,
  `estado` enum('pendiente','enviado','entregado','cancelado') NOT NULL,
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_pedido`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (1,2,'2025-05-04 20:42:38','enviado',17.50),(2,3,'2025-05-06 11:15:39','pendiente',3.00),(3,3,'2025-05-06 11:17:27','pendiente',3.00),(4,3,'2025-05-07 23:39:55','cancelado',19.79),(5,3,'2025-05-08 22:44:10','entregado',23.19),(6,3,'2025-05-16 01:43:46','pendiente',25.69),(7,3,'2025-05-27 11:36:15','pendiente',22.38),(8,3,'2025-05-27 12:31:34','pendiente',39.77),(9,8,'2025-06-03 10:09:05','cancelado',15.69),(10,8,'2025-06-03 10:10:44','pendiente',12.79),(11,7,'2025-06-03 10:13:02','cancelado',9.79);
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos_menus`
--

DROP TABLE IF EXISTS `pedidos_menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos_menus` (
  `id_pedido` int NOT NULL,
  `id_menu` int NOT NULL,
  `cantidad` int DEFAULT NULL,
  PRIMARY KEY (`id_pedido`,`id_menu`),
  KEY `id_menu` (`id_menu`),
  CONSTRAINT `pedidos_menus_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`),
  CONSTRAINT `pedidos_menus_ibfk_2` FOREIGN KEY (`id_menu`) REFERENCES `menus` (`id_menu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos_menus`
--

LOCK TABLES `pedidos_menus` WRITE;
/*!40000 ALTER TABLE `pedidos_menus` DISABLE KEYS */;
INSERT INTO `pedidos_menus` VALUES (1,1,1),(1,3,1),(2,6,1),(3,6,1),(4,3,1),(4,5,1),(4,8,1),(5,1,1),(5,2,1),(5,5,1),(6,2,1),(6,3,1),(6,5,1),(7,1,2),(7,5,2),(8,1,3),(8,3,2),(8,5,3),(9,1,2),(9,5,1),(10,3,1),(10,5,1),(10,6,1),(11,3,1),(11,5,1);
/*!40000 ALTER TABLE `pedidos_menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_dieta`
--

DROP TABLE IF EXISTS `tipo_dieta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_dieta` (
  `id_dieta` int NOT NULL,
  `nombre` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_dieta`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_dieta`
--

LOCK TABLES `tipo_dieta` WRITE;
/*!40000 ALTER TABLE `tipo_dieta` DISABLE KEYS */;
INSERT INTO `tipo_dieta` VALUES (3,'Omnívora'),(4,'Sin gluten'),(1,'Vegana'),(2,'Vegetariana');
/*!40000 ALTER TABLE `tipo_dieta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_plato`
--

DROP TABLE IF EXISTS `tipo_plato`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_plato` (
  `id_plato` int NOT NULL,
  `nombre` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_plato`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_plato`
--

LOCK TABLES `tipo_plato` WRITE;
/*!40000 ALTER TABLE `tipo_plato` DISABLE KEYS */;
INSERT INTO `tipo_plato` VALUES (1,'Entrante'),(3,'Postre'),(2,'Principal');
/*!40000 ALTER TABLE `tipo_plato` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(30) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_usuario` varchar(255) NOT NULL,
  `telefono` varchar(15) NOT NULL,
  `rol_admin` tinyint(1) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `id_usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (2,'Lucía Simón','lucia-sim@yahoo.com','$2b$10$fp0/MTRe7pJ1BNal9CwBZe5j2e5OTCpr6NdSzz0Mv8WhxyD8V5EUq','611111111',0),(3,'Robert Lupu','rogabriel@live.com','$2b$10$Yha2sWPe4zghMch9PEpv/uBUGZN72vsPgCJpEt48zPAWwmkjpuZAS','638443746',0),(4,'José Martínez','jose-mart@gmail.com','$2b$10$xeIkP2V40l6rwKQBdWQ9nezWv8l1BviTX9yE6AiTlFG9N9Qo9u4Ne','000000000',0),(5,'Marcos González','marc.gonz97@outlook.com','$2b$10$PF2QSAPKkfMht2uhCszlIuXZ8vWU1OP7D0jm6ZZMPGt4GCExIWnqy','000000000',0),(7,'admin@zampando.com','admin@zampando.com','$2b$10$j.LGnLjXrCmtQxsWQ0efLu2qpuXInSw7WSPFI6pKioDPeP0Q5QmLC','000000000',1),(8,'Ruben Tamas','ruben-tamas@gmail.com','$2b$10$mSn.Ln3w1e2xvm8u0yI3S.fe4uU5kLI6HuSSom2da1c2fzDdoY8h6','000000000',0);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-03 10:28:44
