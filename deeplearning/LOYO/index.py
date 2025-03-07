# YOLO 算法 进行物体识别分类, 重点理解工作原理
# 下载YOLO 预训练模型进行测试 之后 基于TensorFlow 和keras 版本问题，已经不能顺利运行，
# 模型预训练详见  modelTrain.py 
import argparse
import os
import matplotlib.pyplot as plt
from matplotlib.pyplot import imshow, imread
import scipy.io
import scipy.misc
import numpy as np
# import pandas as pd
import PIL
import tensorflow as tf
from keras.layers import Input, Lambda, Conv2D
from keras.models import load_model, Model
from yolo_utils import read_classes, read_anchors, generate_colors, preprocess_image, draw_boxes, scale_boxes
from yad2k.models.keras_yolo import yolo_head, yolo_boxes_to_corners, preprocess_true_boxes, yolo_loss, yolo_body

# Non-max suppression 处理多个重叠的框
# box_confidence, boxes, box_class_probs 是19*19*5*85 的张量 切割后形成的3组数据，分别是置信度，框的坐标，分类的概率
# 置信度是19*19*5*1 的张量，框的坐标是19*19*5*4 的张量，分类的概率是19*19*5*80 的张量
# 这个函数的作用是通过计算置信度和分类概率的乘积，代表一个ancher box 预测当前是某物体的概率(每个框的分数)，YOLO 中使用了对一个19*19的格子使用了5个ancher box，所以会有5个概率，在这5个中也会取最大值
# 对得到的分数结果进行阈值threshold过滤，形成数据过滤矩阵
# 最后对 分数 box_class_scores，坐标boxes，分类classes 进行过滤，得到最终的结果
# 整个过程相当于找到满足阈值条件的所有推测结果，去掉小于阈值分数(概率极低)的预测结果，保留大于阈值的预测结果
def yolo_filter_boxes(box_confidence, boxes, box_class_probs, threshold = .6):
    """Filters YOLO boxes by thresholding on object and class confidence.
    
    Arguments:
    box_confidence -- tensor of shape (19, 19, 5, 1)  所有𝑝𝑐 的值
    boxes -- tensor of shape (19, 19, 5, 4)  所有𝑏𝑥,𝑏𝑦,𝑏ℎ,𝑏𝑤 的值
    box_class_probs -- tensor of shape (19, 19, 5, 80)  所有c 的值 这里c 有80个分类
    threshold -- real value, if [ highest class probability score < threshold], then get rid of the corresponding box
    
    Returns:
    scores -- tensor of shape (None,), containing the class probability score for selected boxes
    boxes -- tensor of shape (None, 4), containing (b_x, b_y, b_h, b_w) coordinates of selected boxes
    classes -- tensor of shape (None,), containing the index of the class detected by the selected boxes
    
    Note: "None" is here because you don't know the exact number of selected boxes, as it depends on the threshold. 
    For example, the actual output size of scores would be (10,) if there are 10 boxes.
    """
    
    # Step 1: Compute box scores 计算分数 19*19*5*1 * 19*19*5*80 = 19*19*5*80
    box_scores = box_confidence * box_class_probs 

    # Step 2: Find the box_classes using the max box_scores, keep track of the corresponding score
    # 找到分数最大值的索引，K.argmax 函数会沿着指定的轴 axis 计算最大值的索引。在这个例子中，axis=-1 表示沿着最后一个维度计算最大值的索引，会缩减维度。
    # 所以最终得到的 box_classes 是一个形状为 (19, 19, 5) 的张量，其中每个元素表示对应位置的最大分数对应的类别索引。
    box_classes = tf.argmax(box_scores, axis=-1)
    # 找到分数最大值，具体的值，同理K.argmax，也会缩减维度,成为 (19, 19, 5) 的张量
    box_class_scores = tf.reduce_max(box_scores, axis=-1)
    
    # Step 3: Create a filtering mask based on "box_class_scores" by using "threshold". The mask should have the
    # same dimension as box_class_scores, and be True for the boxes you want to keep (with probability >= threshold)
    # 过滤掉小于阈值的分数，得到一个布尔矩阵，True 表示保留，False 表示过滤，生成filter
    filtering_mask = box_class_scores >= threshold
    
    # Step 4: Apply the mask to box_class_scores, boxes and box_classes
   # 对分数，坐标，分类 进行过滤，得到最终的结果，注意这里的操作会直接将不符个合条件的元素删掉
   # 包括对同一object 的多个预测结果，多个object 之间的预测结果，多个ancher box 之间的预测结果，只要不符合阈值，就直接删除
    scores = box_class_scores[filtering_mask]
    boxes = boxes[filtering_mask]
    classes = box_classes[filtering_mask]

    
    return scores, boxes, classes
# *** 测试
# # 生成随机数据
# box_confidence = tf.random.uniform((19, 19, 5, 1), minval=0, maxval=1, dtype=tf.float32)
# boxes = tf.random.uniform((19, 19, 5, 4), minval=0, maxval=1, dtype=tf.float32)
# box_class_probs = tf.random.uniform((19, 19, 5, 80), minval=0, maxval=1, dtype=tf.float32)

# # 调用 yolo_filter_boxes 函数
# threshold = 0.6
# scores, filtered_boxes, classes = yolo_filter_boxes(box_confidence, boxes, box_class_probs, threshold)

# # 打印结果
# print("Scores:", scores)
# print("Boxes:", filtered_boxes)
# print("Classes:", classes)

# 使用坐标进行交并比计算
# 找到左上角坐标值最大的坐标，右下角坐标值最小的坐标，计算交集的面积，
# 计算并集的面积，计算交并比
def iou(box1, box2):
    """Implement the intersection over union (IoU) between box1 and box2
    
    Arguments:
    box1 -- first box, list object with coordinates (box1_x1, box1_y1, box1_x2, box_1_y2)
    box2 -- second box, list object with coordinates (box2_x1, box2_y1, box2_x2, box2_y2)
    """

    # Assign variable names to coordinates for clarity
    (box1_x1, box1_y1, box1_x2, box1_y2) = box1
    (box2_x1, box2_y1, box2_x2, box2_y2) = box2
    
    # Calculate the (yi1, xi1, yi2, xi2) coordinates of the intersection of box1 and box2. Calculate its Area. 计算交集
    xi1 = max(box1_x1, box2_x1)
    yi1 = max(box1_y1, box2_y1)
    xi2 = min(box1_x2, box2_x2)
    yi2 = min(box1_y2, box2_y2)
    inter_width = xi2 - xi1
    inter_height = yi2 - yi1
    inter_area = max(inter_height, 0) * max(inter_width, 0)

    # Calculate the Union area by using Formula: Union(A,B) = A + B - Inter(A,B) 计算并集
    box1_area = (box1_x2 - box1_x1) * (box1_y2 - box1_y1)
    box2_area = (box2_x2 - box2_x1) * (box2_y2 - box2_y1)
    union_area = box1_area + box2_area - inter_area
    
    # compute the IoU 计算交并比
    iou = inter_area / union_area 
    return iou
# *** 测试
# box1 = (2, 1, 4, 3)
# box2 = (1, 2, 3, 4) 
# print("iou for intersecting boxes = " + str(iou(box1, box2)))

# 使用tf.image.non_max_suppression实现非极大值抑制
# tf.image.non_max_suppression 介绍

# 工作原理
# 输入参数:
# boxes: 一个形状为 [num_boxes, 4] 的张量，表示所有候选边界框的坐标。每个边界框由四个值表示 [y1, x1, y2, x2]，分别是左上角和右下角的坐标。
# scores: 一个形状为 [num_boxes] 的张量，表示每个边界框的置信度分数。
# max_output_size: 一个整数，表示最多保留的边界框数量。
# iou_threshold: 一个浮点数，表示用于 NMS 过滤的 "intersection over union" 阈值。
# score_threshold（可选）: 一个浮点数，表示过滤掉置信度分数低于该值的边界框。

# 处理步骤:
# 排序: 根据 scores 对所有候选边界框进行排序，从高到低排列。
# 选择框: 从排序后的列表中选择置信度最高的边界框作为当前框。
# 计算 IoU: 计算当前框与剩余所有边界框之间的 IoU（交并比）。
# 过滤框: 将 IoU 大于 iou_threshold 的边界框移除，因为这些边界框与当前框重叠度太高。
# 重复: 重复上述步骤，直到没有更多的边界框或者达到 max_output_size。
# 输出结果:
# 返回一个包含保留边界框索引的张量。 📢注意这里返回的是索引

# 本函数 输入是经过过滤后的分数，坐标，分类，最多保留框数，交并比阈值，
# 输出是经过非极大值抑制后的分数，坐标，分类
# 注意这里没有针对某一个具体分类进行处理，而是对所有分类同时进行处理，
# 拿到是置信度最高的分类，能输出几个分类，取决于max_boxes，和置信度高的框的自己本身的分类
# 也就是说，如果最终保留下来的框有重复的类，说明输入的框中可能存在位置距离较远的相同的分类物体
# 所以如果最终保留下来的框有的类都不重复，说明输入的框中可能存在位置距离较远的不同的分类物体，
# 即即使是不同分类，如果接近最高置信度的框，也会被干掉，这种情况说明输入的框中可能存在，一个ancher box 中存在两个种类的object
# 这种情况需要定义两种不同形状的ancher box, 同时对两种object 进行同时预测
# https://yoohannah.github.io/image/deepLearning/163.png

def yolo_non_max_suppression(scores, boxes, classes, max_boxes=10, iou_threshold=0.5):
    """
    Applies Non-max suppression (NMS) to set of boxes
    
    Arguments:
    scores -- tensor of shape (None,), output of yolo_filter_boxes()
    boxes -- tensor of shape (None, 4), output of yolo_filter_boxes() that have been scaled to the image size (see later)
    classes -- tensor of shape (None,), output of yolo_filter_boxes()
    max_boxes -- integer, maximum number of predicted boxes you'd like
    iou_threshold -- real value, "intersection over union" threshold used for NMS filtering
    
    Returns:
    scores -- tensor of shape (, None), predicted score for each box
    boxes -- tensor of shape (4, None), predicted box coordinates
    classes -- tensor of shape (, None), predicted class for each box
    
    Note: The "None" dimension of the output tensors has obviously to be less than max_boxes. Note also that this
    function will transpose the shapes of scores, boxes, classes. This is made for convenience.
    """
    
    # Use tf.image.non_max_suppression() to get the list of indices corresponding to boxes you keep
    nms_indices = tf.image.non_max_suppression(boxes, scores, max_output_size=max_boxes, iou_threshold=iou_threshold)
    
    print("nms_indices:", nms_indices)
    # Use tf.gather() to select only nms_indices from scores, boxes and classes
    # 根据预测结果的索引，从scores, boxes, classes 中获取对应的预测结果
    scores = tf.gather(scores, nms_indices)
    boxes = tf.gather(boxes, nms_indices)
    classes = tf.gather(classes, nms_indices)
    
    return scores, boxes, classes

# 示例调用
# scores = tf.constant([0.9, 0.75, 0.6, 0.85], dtype=tf.float32)
# boxes = tf.constant([[0.1, 0.1, 0.5, 0.5],
#                      [0.2, 0.2, 0.6, 0.6],
#                      [0.3, 0.3, 0.7, 0.7],
#                      [0.4, 0.4, 0.8, 0.8]], dtype=tf.float32)
# classes = tf.constant([1, 2, 3, 1], dtype=tf.int32)

# max_boxes = 2
# iou_threshold = 0.5

# selected_scores, selected_boxes, selected_classes = yolo_non_max_suppression(scores, boxes, classes, max_boxes, iou_threshold)

# print("Selected scores:", selected_scores.numpy())
# print("Selected boxes:", selected_boxes.numpy())
# print("Selected classes:", selected_classes.numpy())

# 打印值
# nms_indices: tf.Tensor([0 3], shape=(2,), dtype=int32)
# Selected scores: [0.9  0.85]
# Selected boxes: [[0.1 0.1 0.5 0.5]
#  [0.4 0.4 0.8 0.8]]
# Selected classes: [1 1]

def yolo_eval(yolo_outputs, image_shape = (720., 1280.), max_boxes=10, score_threshold=.6, iou_threshold=.5):
    """
    Converts the output of YOLO encoding (a lot of boxes) to your predicted boxes along with their scores, box coordinates and classes.
    
    Arguments:
    yolo_outputs -- output of the encoding model (for image_shape of (608, 608, 3)), contains 4 tensors:
                    box_confidence: tensor of shape (None, 19, 19, 5, 1)
                    box_xy: tensor of shape (None, 19, 19, 5, 2)
                    box_wh: tensor of shape (None, 19, 19, 5, 2)
                    box_class_probs: tensor of shape (None, 19, 19, 5, 80)
    image_shape -- tensor of shape (2,) containing the input shape, in this notebook we use (608., 608.) (has to be float32 dtype)
    max_boxes -- integer, maximum number of predicted boxes you'd like
    score_threshold -- real value, if [ highest class probability score < threshold], then get rid of the corresponding box
    iou_threshold -- real value, "intersection over union" threshold used for NMS filtering
    
    Returns:
    scores -- tensor of shape (None, ), predicted score for each box
    boxes -- tensor of shape (None, 4), predicted box coordinates
    classes -- tensor of shape (None,), predicted class for each box
    """
    
    # Retrieve outputs of the YOLO model (≈1 line) 
    # 从yolo_outputs 中获取 box_confidence, box_xy, box_wh, box_class_probs
    box_confidence, box_xy, box_wh, box_class_probs = yolo_outputs

    # Convert boxes to be ready for filtering functions (convert boxes box_xy and box_wh to corner coordinates)
    # 把box_xy 和 box_wh 转换为 corner coordinates
    boxes = yolo_boxes_to_corners(box_xy, box_wh)

    # Use one of the functions you've implemented to perform Score-filtering with a threshold of score_threshold (≈1 line)
    # 过滤掉小于阈值的边框
    scores, boxes, classes = yolo_filter_boxes(box_confidence, boxes, box_class_probs, score_threshold)
    
    # Scale boxes back to original image shape.
    # 把边框的坐标转换为原始图像的尺寸
    boxes = scale_boxes(boxes, image_shape)

    # Use one of the functions you've implemented to perform Non-max suppression with 
    # maximum number of boxes set to max_boxes and a threshold of iou_threshold (≈1 line)
    # 非极大值抑制，过滤掉重叠的边框
    scores, boxes, classes = yolo_non_max_suppression(scores, boxes, classes, max_boxes, iou_threshold)
    
    return scores, boxes, classes

# 示例调用
# yolo_outputs = (tf.random.normal([19, 19, 5, 1], mean=1, stddev=4, seed=1),
#                 tf.random.normal([19, 19, 5, 2], mean=1, stddev=4, seed=1),
#                 tf.random.normal([19, 19, 5, 2], mean=1, stddev=4, seed=1),
#                 tf.random.normal([19, 19, 5, 80], mean=1, stddev=4, seed=1))

# # 执行 yolo_eval 函数
# scores, boxes, classes = yolo_eval(yolo_outputs)

# # 打印结果
# print("scores[2] =", scores[2].numpy())
# print("boxes[2] =", boxes[2].numpy())
# print("classes[2] =", classes[2].numpy())
# print("scores.shape =", scores.shape)
# print("boxes.shape =", boxes.shape)
# print("classes.shape =", classes.shape)

# 下载YOLO 预训练模型进行测试
# 下载预训练模型
# wget https://pjreddie.com/media/files/yolov2.weights
# python yad2k.py cfg/yolov2.cfg yolov2.weights model_data/yolo.h5
# 下载测试图片
class_names = read_classes("model_data/coco_classes.txt")
anchors = read_anchors("model_data/yolo_anchors.txt")
image_shape = (720., 1280.) 
yolo_model = load_model("model_data/yolo.h5", compile=False)

yolo_model.summary()

# 将模型输出 切片 分成 4 个部分，box_confidence, boxes, box_class_probs
yolo_outputs = yolo_head(yolo_model.output, anchors, len(class_names)) 

scores, boxes, classes = yolo_eval(yolo_outputs, image_shape)


def predict(model, image_file, class_names):
    """
    Runs the model to predict boxes for "image_file". Prints and plots the predictions.
    
    Arguments:
    model -- your tensorflow/Keras model containing the YOLO graph
    image_file -- name of an image stored in the "images" folder.
    class_names -- list of class names
    
    Returns:
    out_scores -- tensor of shape (None, ), scores of the predicted boxes
    out_boxes -- tensor of shape (None, 4), coordinates of the predicted boxes
    out_classes -- tensor of shape (None, ), class index of the predicted boxes
    
    Note: "None" actually represents the number of predicted boxes, it varies between 0 and max_boxes. 
    """
    
    # Preprocess your image
    image, image_data = preprocess_image("images/" + image_file, model_image_size=(608, 608))
    
    # Run the model
    outputs = model(image_data, training=False)
    out_boxes, out_scores, out_classes = outputs['boxes'], outputs['scores'], outputs['classes']
    
    # Print predictions info
    print('Found {} boxes for {}'.format(len(out_boxes), image_file))
    
    # Generate colors for drawing bounding boxes.
    colors = generate_colors(class_names)
    
    # Draw bounding boxes on the image file
    draw_boxes(image, out_scores, out_boxes, out_classes, class_names, colors)
    
    # Save the predicted bounding box on the image
    image.save(os.path.join("out", image_file), quality=90)
    
    # Display the results in the notebook
    output_image = imread(os.path.join("out", image_file))
    imshow(output_image)
    
    return out_scores, out_boxes, out_classes

# 假设你已经加载了 YOLO 模型 yolo_model 和类别名称 class_names
# 例如：
# yolo_model = tf.keras.models.load_model('path/to/yolo_model.h5')
# class_names = ["person", "bicycle", "car", ...]

# 使用示例
out_scores, out_boxes, out_classes = predict(yolo_model, 'test.jpg', class_names)

# What you should remember:
# YOLO is a state-of-the-art object detection model that is fast and accurate
# It runs an input image through a CNN which outputs a 19x19x5x85 dimensional volume.
# The encoding can be seen as a grid where each of the 19x19 cells contains information about 5 boxes.
# You filter through all the boxes using non-max suppression. Specifically:
#    Score thresholding on the probability of detecting a class to keep only accurate (high probability) boxes
#    Intersection over Union (IoU) thresholding to eliminate overlapping boxes


