<?php
//PHP为文件类数据准备了一个专用的系统函数$_FILES，上传文件的所有相关数据，都保存在这个系统函数中。
//其实是一个数组，数组每一个元素为文件一个属性

//第一步，判断错误码
if ($_FILES['file']['error'] > 0) {
   switch ($_FILES['file']['error']) {
       //错误码不为0，即文件上传过程中出现了错误
       case '1':
           echo '文件过大';
           break;
       case '2':
           echo '文件超出指定大小';
           break;
       case '3':
           echo '只有部分文件被上传';
           break;
       case '4':
           echo '文件没有被上传';
           break;
       case '6':
           echo '找不到指定文件夹';
           break;
       case '7':
           echo '文件写入失败';
           break;
       default:
           echo "上传出错<br/>";
   }
} else {
//第二步，判断文件是否超出大小。 在实际项目中，由于系统硬件的限制，以及存储设备的限制，不可能让用户无限制的上传文件，所以我们要对用户上传的文件大小进行限制。定义一个合适的限制大小，能让我们的应用更稳定的运行。
// 指定的文件大小，定义为$MAX_FILE_SIZE，该变量的计数单位为byte，对应上传文件的 $_FILES['file']['size']大小。
   $MAX_FILE_SIZE = 100000;
   if ($_FILES['file']['size'] > $MAX_FILE_SIZE) {
       exit("文件超出指定大小");

   }

//第三步，判断文件的mime类型是否正确
//当前项目指定上传后缀为.jpg或.gif的图片
   $allowSuffix = array(
       'jpg',
       'gif',
       'png'
   );
////定义允许的后缀名数组
//explode() 将一个字符串用指定的字符切割，并返回一个数组，这里我们将文件名用'.''切割,结果存在$myImg中，文件的后缀名即为数组的最后一个值
   $myImg = explode('.', $_FILES['file']['name']);
/*
根据上传文件名获取文件的后缀名
使用in_array()函数，判断上传文件是否符合要求
当文件后缀名不在我们允许的范围内时退出上传并返回错误信息
*/
   $myImgSuffix = array_pop($myImg);

   if (!in_array($myImgSuffix, $allowSuffix)) {
       exit("文件后缀名不符");
   }

   $allowMime = array(
       "image/jpg",
       "image/jpeg",
       "image/pjpeg",
       "image/gif",
       "image/png",
   );

   if (!in_array($_FILES['file']['type'], $allowMime)) {
       exit('文件格式不正确，请检查');
   }
//指定临时的上传路径和名称
   $path = "upload/images/";//该路径与本文件在同一级文件夹，要提前建好文件夹，否则会因为找不到存储地址上传失败
   $name = date('Y') . date('m') . date("d") . date('H') . date('i') . date('s') . rand(0, 9) . '.' . $myImgSuffix;

//is_uploaded_file()函数是专用的函数，来判断目标文件是否是上传文件。
   if (is_uploaded_file($_FILES['file']['tmp_name'])) {
//使用move_uploaded_file()移动上传文件至指定位置,第一个参数为上传文件，第二个参数为我们在前面指定的上传路径和名称
       if (move_uploaded_file($_FILES['file']['tmp_name'], $path . $name)) {
           echo "上传成功";
       } else {
//文件移动失败，检查磁盘是否有足够的空间，或者linux类系统中文件夹是否有足够的操作权限
           echo '上传失败';
       }

   } else {
       echo '不是上传文件';
   }

}
?>