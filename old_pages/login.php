<?php
	$app_id = "172708956215256";
	$app_secret = "17de81e1e2f9e9a4ba0893fcda63b6b3";
	$my_url = "https://contrib.andrew.cmu.edu/~jnakayama/";

	session_start();

	$code = $_REQUEST["code"];	
	
	if(empty($code)) {
		$_SESSION['state'] = md5(uniqid(rand(), TRUE));
		$dialog_rul = "https://www.facebook.com/dialog/oauth?client_id="
		. $app_id . "&redirect_uri=" . urlencode($my_url) . "&state="
		. $_SESSION['state'];

	header("Location: " . $dialog_url);
	}		
?>