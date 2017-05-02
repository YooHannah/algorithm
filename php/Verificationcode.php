<?php

check_code();

function check_code($width = 100, $height = 50, $num = 4, $type = 'jpeg') {

 $img = imagecreate($width, $height);
 //生成验证码显示的文字
 $string = '';
 for ($i = 0; $i < $num; $i++) {
 $rand = mt_rand(0, 2);
 switch ($rand) {
 case 0:
 $ascii = mt_rand(48, 57); //0-9
 break;
 case 1:
 $ascii = mt_rand(65, 90); //A-Z
 break;

 case 2:
 $ascii = mt_rand(97, 122); //a-z
 break;
 }
 //chr()
 $string .= sprintf('%c', $ascii);

 }
 //背景颜色
 imagefilledrectangle($img, 0, 0, $width, $height, randBg($img));

 //画干扰元素
//生成50个深色点
 for ($i = 0; $i < 50; $i++) {

 imagesetpixel($img, mt_rand(0, $width), mt_rand(0, $height), randPix($img));

 }
 //写字
 //在可掌握的环境里生成随机位置放验证码
 for ($i = 0; $i < $num; $i++) {
 $x = floor($width / $num) * $i + 2;
 $y = mt_rand(0, $height - 15);

 imagechar($img, 5, $x, $y, $string[$i], randPix($img));

 }

 //imagejpeg
//图像类型的输出函数有：imagejpeg,imagepng,imagegif等，这里根据类型确定输出函数
 $func = 'image' . $type;
//输出header类型的时候执行header
 $header = 'Content-type:image/' . $type;
//使用function_exists检测函数是否存在。存在则系统支持该类型，不存在则不支持该类型。
 if (function_exists($func)) {
 header($header);
 $func($img);
 } else {

 echo '图片类型不支持';
 }
 imagedestroy($img);
 return $string;//方便与用户输入作比较
}
//浅色的背景
function randBg($img) {
 return imagecolorallocate($img, mt_rand(130, 255), mt_rand(130, 255), mt_rand(130, 255));
}
// 生成深颜色 用于字或者点这些干 扰元素
function randPix($img) {
 return imagecolorallocate($img, mt_rand(0, 120), mt_rand(0, 120), mt_rand(0, 120));
}

?>