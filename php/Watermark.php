<?php

water('http://pic2.ooopic.com/12/34/75/41bOOOPIC7f_1024.jpg','http://img16.3lian.com/gif2016/q5/86/2.jpg',9,50);

function water($img,$water,$pos=9,$tm=100){

   $info=getImageInfo($img);

   $logo=getImageInfo($water);

   $dst=openImg($img,$info['type']);
   $src=openImg($water,$logo['type']);

  //将要加水印的图片根据水印图片分为10个值，分别为0-9。
   switch($pos){
       case 1:
           $x=0;
           $y=0;
           break;
       case 2:
           $x=ceil(($info['width']-$logo['width'])/2);
           $y=0;
           break;
       case 3:
           $x=$info['width']-$logo['width'];
           $y=0;
           break;
       case 4:
           $x=0;
           $y=ceil(($info['height']-$logo['height'])/2);
           break;
       case 5:
           $x=ceil(($info['width']-$logo['width'])/2);
           $y=ceil(($info['height']-$logo['height'])/2);
           break;
       case 6:
           $x=$info['width']-$logo['width'];
           $y=ceil(($info['height']-$logo['height'])/2);
           break;

       case 7:
           $x=0;
           $y=$info['height']-$logo['height'];
           break;
       case 8:
           $x=ceil(($info['width']-$logo['width'])/2);
           $y=$info['height']-$logo['height'];
           break;
       case 9://右下角
           $x=$info['width']-$logo['width'];
           $y=$info['height']-$logo['height'];
           break;
       case 0:
       default:
           $x=mt_rand(0,$info['width']-$logo['width']);
           $y=mt_rand(0,$y=$info['height']-$logo['height']);
           break;

   }
   //调用一下图片的合并、输出和销毁
   imagecopymerge($dst,$src,$x,$y,0,0,$logo['width'],$logo['height'],$tm);

   header('Content-type:image/jpeg');
   imagejpeg($dst);

   imagedestory($dst);
   imagedestory($src);

}
//传入图片的路径，将图片的宽、高、图片的MIME类型全部返回一个数组，需要的时候使用对应的参数即可。
function getImageInfo($path) {
    $info = getimagesize($path);
    $data['width'] = $info[0];
    $data['height'] = $info[1];
    $data['type'] = $info['mime'];
    return $data;
}

//根据类型使用不同的图片打开函数
   function openImg($path,$type){
       switch($type){
           case 'image/jpeg':
           case 'image/jpg':
           case 'image/pjpeg':
               $img=imagecreatefromjpeg($path);
               break;
           case 'image/png':
           case 'image/x-png':
               $img=imagecreatefrompng($path);
               break;
           case 'image/gif':
               $img=imagecreatefromgif($path);
               break;
           case 'image/wbmp':
               $img=imagecreatefromwbmp($path);
               break;
           default:
               exit('图片类型不支持');


       }
       return $img;
   }




?>