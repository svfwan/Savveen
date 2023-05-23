-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 23, 2023 at 11:05 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `savveen`
--

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `kategorie` varchar(250) NOT NULL,
  `name` varchar(250) NOT NULL,
  `preis` float NOT NULL,
  `beschreibung` text NOT NULL,
  `bewertung` int(11) NOT NULL DEFAULT 0,
  `bestand` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `kategorie`, `name`, `preis`, `beschreibung`, `bewertung`, `bestand`) VALUES
(1, 'Skincare', 'Creme', 20, '', 3, 1),
(2, 'Make-Up', 'Foundation', 35, '', 5, 1),
(3, 'Parfüm', 'Dior Sauvage', 110, '', 5, 1),
(4, 'Skincare', 'Toner', 11, '', 2, 0),
(5, 'Skincare', 'Himalaya Maske', 34.5, '0', 0, 12),
(6, 'Skincare', 'Chanel No. 5', 140, '0', 0, 5);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(100) NOT NULL,
  `admin` tinyint(100) NOT NULL DEFAULT 0,
  `active` tinyint(100) NOT NULL DEFAULT 1,
  `anrede` varchar(100) NOT NULL,
  `vorname` varchar(255) NOT NULL,
  `nachname` varchar(255) NOT NULL,
  `adresse` varchar(255) NOT NULL,
  `plz` varchar(255) NOT NULL,
  `ort` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `passwort` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `admin`, `active`, `anrede`, `vorname`, `nachname`, `adresse`, `plz`, `ort`, `email`, `username`, `passwort`) VALUES
(1, 0, 1, 'Herr', 'Test', 'Test', 'Test', '1234', 'Wien', 'test@test.at', 'test123', '$2y$10$qPSu2BSVyCNAtG/qNhoHDuPrIW448bLfCK7dWIP1YUaCT4ojg8JZ.'),
(2, 1, 1, 'Frau', 'Admin', 'Admin', 'Anonym-Straße 1', '1111', 'Wien', 'admin@network.at', 'admin', '$2y$10$MF9G67H1Xyv6gSYS1gtlweQd7qhdPE7a0EsEwF1niSQX.FbqnJhz6');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
