<?php


?>
<!-- formulaire.html -->
 <!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Formulaire de Contact</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        .error { color: red; }
        .success { color: green; }
    </style>
</head>
<body>
    <h2>Formulaire de Contact</h2>
    <?php
    // Initialisation des variables
    $name = $email = $message = "";
    $nameErr = $emailErr = $messageErr = "";
    $success = "";

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        // Validation du nom
        if (empty($_POST["name"])) {
            $nameErr = "Le nom est requis";
        } else {
            $name = test_input($_POST["name"]);
            if (!preg_match("/^[a-zA-Z ]*$/",$name)) {
                $nameErr = "Seules les lettres et espaces sont autorisés";
            }
        }

        // Validation de l'email
        if (empty($_POST["email"])) {
            $emailErr = "L'email est requis";
        } else {
            $email = test_input($_POST["email"]);
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $emailErr = "Format d'email invalide";
            }
        }

        // Validation du message
        if (empty($_POST["message"])) {
            $messageErr = "Le message est requis";
        } else {
            $message = test_input($_POST["message"]);
        }

        // Si pas d'erreurs, envoyer l'email
        if ($nameErr == "" && $emailErr == "" && $messageErr == "") {
            $to = "votre@email.com"; // Remplacer par votre email
            $subject = "Nouveau message de contact";
            $body = "Nom: $name\nEmail: $email\nMessage:\n$message";
            $headers = "From: $email";

            if (mail($to, $subject, $body, $headers)) {
                $success = "Message envoyé avec succès !";
                $name = $email = $message = "";
            } else {
                $success = "Erreur lors de l'envoi du message.";
            }
        }
    }

    // Fonction pour nettoyer les données
    function test_input($data) {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        return $data;
    }
    ?>

    <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
        <label for="name">Nom :</label><br>
        <input type="text" name="name" value="<?php echo $name;?>">
        <span class="error"><?php echo $nameErr;?></span><br>

        <label for="email">Email :</label><br>
        <input type="email" name="email" value="<?php echo $email;?>">
        <span class="error"><?php echo $emailErr;?></span><br>

        <label for="message">Message :</label><br>
        <textarea name="message" rows="5" cols="40"><?php echo $message;?></textarea>
        <span class="error"><?php echo $messageErr;?></span><br><br>

        <input type="submit" value="Envoyer">
    </form>

    <span class="success"><?php echo $success;?></span>
</body>
</html>