<?php
// get the posted file
$file = $_FILES['file'];

//get the selected language
$lang = $_POST['lang'];

// Original name of the file on the client machine
$name = $file['name'];

// The mime type of the file, if the browser provided this information
$type = $file['type'];

// The size, in bytes, of the uploaded file
$size = $file['size'];    

// The temporary filename of the file in which the uploaded file was stored on the server
$tmp_name = $file['tmp_name'];

// The error code associated with this file upload
$error = $file['error'];

//prepare the uploaded file info for the python script
//check for errors
$phpFileUploadErrors = array(
    0 => 'There is no error, the file uploaded with success',
    1 => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
    2 => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form',
    3 => 'The uploaded file was only partially uploaded',
    4 => 'No file was uploaded',
    6 => 'Missing a temporary folder',
    7 => 'Failed to write file to disk.',
    8 => 'A PHP extension stopped the file upload.',
);

//if error is not 0, then return the error message in json format with status and message fields
if ($error !== 0) {
    echo json_encode(['status' => 'error', 'message' => $phpFileUploadErrors[$error]]);
    exit;
}

// Call the Python script filename, filesize, temporary filename and other necessary arguments

// localhost test version
// $output = shell_exec("python main.py $name $size $tmp_name");
//localhost virt env version
$output = shell_exec(".\.env\Scripts\python.exe main.py $name $size $tmp_name $lang");
//crowd server path
// $output = shell_exec("C:\\Python\Python312\python.exe python_script.py $testarg1 $testarg2");

//save the output to a file
// $myfile = fopen("output.txt", "w") or die("Unable to open file!");
// fwrite($myfile, $output);
// fclose($myfile);

echo trim($output);
?>
