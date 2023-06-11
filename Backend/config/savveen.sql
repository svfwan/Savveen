-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 12, 2023 at 01:22 AM
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
-- Table structure for table `orderlines`
--

CREATE TABLE `orderlines` (
  `id` int(11) NOT NULL,
  `receipt_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `preis` float NOT NULL,
  `anzahl` int(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `orderlines`
--

INSERT INTO `orderlines` (`id`, `receipt_id`, `product_id`, `preis`, `anzahl`) VALUES
(18, 7, 15, 110, 1),
(19, 7, 14, 30, 1),
(20, 7, 12, 25, 3),
(21, 7, 30, 20, 2),
(22, 7, 33, 75, 1),
(23, 8, 15, 110, 3),
(24, 9, 33, 75, 1),
(25, 9, 30, 20, 1),
(26, 9, 14, 30, 2),
(27, 9, 12, 25, 2),
(28, 9, 15, 110, 2),
(29, 9, 29, 18, 1),
(30, 10, 14, 30, 3),
(31, 10, 12, 25, 4),
(32, 10, 15, 110, 2),
(33, 11, 14, 30, 1),
(34, 11, 15, 110, 1),
(35, 11, 33, 75, 1),
(37, 12, 12, 25, 3),
(38, 12, 14, 30, 1),
(39, 13, 12, 25, 3),
(40, 13, 14, 30, 2);

--
-- Triggers `orderlines`
--
DELIMITER $$
CREATE TRIGGER `orderlines_delete_update_receipt` AFTER DELETE ON `orderlines` FOR EACH ROW BEGIN
    DECLARE receiptID INT;
    SET receiptID = OLD.receipt_id;

    UPDATE receipts
    SET summe = (SELECT SUM(preis * anzahl) FROM orderlines WHERE receipt_id = receiptID)
    WHERE id = receiptID;

    IF NOT EXISTS (SELECT 1 FROM orderlines WHERE receipt_id = receiptID) THEN
        DELETE FROM receipts WHERE id = receiptID;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `receipts_update_summe` AFTER INSERT ON `orderlines` FOR EACH ROW BEGIN
    UPDATE receipts
    SET summe = (SELECT SUM(preis * anzahl) FROM orderlines WHERE receipt_id = NEW.receipt_id)
    WHERE id = NEW.receipt_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `kategorie` varchar(250) NOT NULL,
  `name` varchar(250) NOT NULL,
  `preis` int(11) NOT NULL,
  `beschreibung` text NOT NULL,
  `bewertung` int(20) NOT NULL DEFAULT 5
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `kategorie`, `name`, `preis`, `beschreibung`, `bewertung`) VALUES
(12, 'Skincare', 'Toner Premium', 25, 'Ein Favorit', 5),
(14, 'Make-Up', 'Make-Up Set', 30, 'Nachwertiges Top-Produkt', 5),
(15, 'Parfüm', 'The Village', 110, 'Unser Bestseller', 5),
(29, 'Skincare', 'Bio Cleanser', 18, 'Reinigt die Haut', 5),
(30, 'Make-Up', 'Sea Mineral Mist', 20, 'Ölfrei', 5),
(33, 'Parfüm', 'Green Jungle', 75, 'Für Abenteurer', 5);

-- --------------------------------------------------------

--
-- Table structure for table `receipts`
--

CREATE TABLE `receipts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `summe` int(11) NOT NULL,
  `strasse` varchar(256) NOT NULL,
  `plz` varchar(256) NOT NULL,
  `ort` varchar(256) NOT NULL,
  `datum` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `receipts`
--

INSERT INTO `receipts` (`id`, `user_id`, `summe`, `strasse`, `plz`, `ort`, `datum`) VALUES
(7, 14, 330, 'Teststrasse 1', '1212', 'Wien', '2023-06-10'),
(8, 14, 330, 'Donauinselplatz 1', '1210', 'Wien', '2023-06-10'),
(9, 14, 443, 'Teststrasse 1', '1212', 'Wien', '2023-06-10'),
(10, 14, 410, 'Teststrasse 1', '1212', 'Wien', '2023-06-11'),
(11, 8, 215, 'Hallochenstrasse', '1220', 'Wien', '2023-06-11'),
(12, 8, 105, 'Hallochenstrasse', '1220', 'Wien', '2023-06-11'),
(13, 14, 135, 'Teststrasse 1', '1212', 'Wien', '2023-06-11');

--
-- Triggers `receipts`
--
DELIMITER $$
CREATE TRIGGER `orderlines_update_anzahl` AFTER INSERT ON `receipts` FOR EACH ROW BEGIN
    UPDATE orderlines
    SET anzahl = (SELECT SUM(anzahl) FROM orderlines WHERE receipt_id = NEW.id)
    WHERE receipt_id = NEW.id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(100) NOT NULL,
  `admin` tinyint(100) NOT NULL DEFAULT 0,
  `aktiv` tinyint(100) NOT NULL DEFAULT 1,
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

INSERT INTO `users` (`id`, `admin`, `aktiv`, `anrede`, `vorname`, `nachname`, `adresse`, `plz`, `ort`, `email`, `username`, `passwort`) VALUES
(8, 0, 1, 'Frau', 'Martina', 'Musterfrau', 'Hallochenstrasse', '1220', 'Wien', 'martina@martina.at', 'martina', '$2y$10$6POKO4DKi/tlU4xR6ng40uJ/OYUCa5oaRFq.J/q4F3ahFwpIaIoGi'),
(11, 1, 1, 'Herr', 'Admin', 'Adminov', 'Strasse 1', '1020', '1200', 'admin@admin.at', 'admin', '$2y$10$vpVMHlmp1jlvG4uffYgK2.wvlyogEw/eoSGSoxDBbpYc.vCf7ht9S'),
(14, 0, 1, 'Herr', 'Tester', 'Testmann', 'Teststrasse 1', '1212', 'Wien', 'test@test.at', 'test123', '$2y$10$wLPNORYFrEFSn.F6lfoft.KzAsPDxECNXAc/nPu0TsDIgJfOWLPtK');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `orderlines`
--
ALTER TABLE `orderlines`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `receipts`
--
ALTER TABLE `receipts`
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
-- AUTO_INCREMENT for table `orderlines`
--
ALTER TABLE `orderlines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `receipts`
--
ALTER TABLE `receipts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
