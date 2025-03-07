# 神经样式迁移 ，两张图片合成生成新图片
import os
import sys
import scipy.io
import scipy.misc
import matplotlib.pyplot as plt
from matplotlib.pyplot import imshow, imread
from PIL import Image
from nst_utils import *
import numpy as np
import tensorflow as tf
import pprint

# use VGG-19, a 19-layer version of the VGG network. 
# This model has already been trained on the very large ImageNet database, 
# and thus has learned to recognize a variety of low level features (at the shallower layers) and high level features (at the deeper layers).

# The model is stored in a python dictionary.
# The python dictionary contains key-value pairs for each layer.
# The 'key' is the variable name and the 'value' is a tensor for that layer.

# Activate a layer 获取指定激活层的输出
# After this, if you want to access the activations of a particular layer, 
# say layer 4_2 when the network is run on this image, 
# you would run a TensorFlow session on the correct tensor conv4_2, as follows:

# layer_name = 'conv4_2'
# intermediate_layer_model = Model(inputs=model.input, outputs=model.get_layer(layer_name).output)
# Compute the content cost
# 输入一个随机图像
#input_image = tf.random.normal([1, 64, 64, 3])
# 获取特定层的激活值
#intermediate_output = intermediate_layer_model(input_image) # 直接输入图像数据

pp = pprint.PrettyPrinter(indent=4)
model = load_vgg_model("pretrained-model/imagenet-vgg-verydeep-19.mat")
pp.pprint(model)

# 打印模型摘要
model.summary()

# 计算content cost
def compute_content_cost(a_C, a_G):
    """
    Computes the content cost
    
    Arguments:
    a_C -- tensor of dimension (1, n_H, n_W, n_C), hidden layer activations representing content of the image C 
    a_G -- tensor of dimension (1, n_H, n_W, n_C), hidden layer activations representing content of the image G
    
    Returns: 
    J_content -- scalar that you compute using equation 1 above.
    """
    
    ### START CODE HERE ###
    # Retrieve dimensions from a_G (≈1 line)
    m, n_H, n_W, n_C = a_G.get_shape().as_list()
    
    # Reshape a_C and a_G (≈2 lines)
    a_C_unrolled = tf.reshape(a_C, [m, -1, n_C])
    a_G_unrolled = tf.reshape(a_G, [m, -1, n_C])
    
    # compute the cost with tensorflow (≈1 line)
    J_content = tf.reduce_sum(tf.square(a_C_unrolled - a_G_unrolled)) / (4 * n_H * n_W * n_C)
    ### END CODE HERE ###
    
    return J_content

## style cost

def gram_matrix(A):
    """
    Argument:
    A -- matrix of shape (n_C, n_H*n_W)
    
    Returns:
    GA -- Gram matrix of A, of shape (n_C, n_C)
    """
    
    ### START CODE HERE ### (≈1 line)
    GA = tf.matmul(A, tf.transpose(A))
    ### END CODE HERE ###
    
    return GA

def compute_layer_style_cost(a_S, a_G):
    """
    Arguments:
    a_S -- tensor of dimension (1, n_H, n_W, n_C), hidden layer activations representing style of the image S 
    a_G -- tensor of dimension (1, n_H, n_W, n_C), hidden layer activations representing style of the image G
    
    Returns: 
    J_style_layer -- tensor representing a scalar value, style cost defined above by equation (2)
    """
    
    ### START CODE HERE ###
    # Retrieve dimensions from a_G (≈1 line)
    m, n_H, n_W, n_C = a_G.get_shape().as_list()
    
    # Reshape the images to have them of shape (n_C, n_H*n_W) (≈2 lines)
    a_S = tf.transpose(tf.reshape(a_S, [-1, n_C]))
    a_G = tf.transpose(tf.reshape(a_G, [-1, n_C]))

    # Computing gram_matrices for both images S and G (≈2 lines)
    GS = gram_matrix(a_S)
    GG = gram_matrix(a_G)

    # Computing the loss (≈1 line)
    J_style_layer = tf.reduce_sum(tf.square(GS - GG)) / tf.square(2. * n_C * n_H * n_W)
    
    ### END CODE HERE ###
    
    return J_style_layer

STYLE_LAYERS = [
    ('conv1_1', 0.2),
    ('conv2_1', 0.2),
    ('conv3_1', 0.2),
    ('conv4_1', 0.2),
    ('conv5_1', 0.2)]

# Description of compute_style_cost
# For each layer:

#   Select the activation (the output tensor) of the current layer.
#   Get the style of the style image "S" from the current layer.
#   Get the style of the generated image "G" from the current layer.
#   Compute the "style cost" for the current layer
#   Add the weighted style cost to the overall style cost (J_style)
# Once you're done with the loop:
#   Return the overall style cost.
# https://yoohannah.github.io/image/deepLearning/207.png

# The style of an image can be represented using the Gram matrix of a hidden layer's activations.
# We get even better results by combining this representation from multiple different layers.
# This is in contrast to the content representation, where usually using just a single hidden layer is sufficient.
# Minimizing the style cost will cause the image  𝐺  to follow the style of the image  𝑆 .
def compute_style_cost(model, STYLE_LAYERS):
    """
    Computes the overall style cost from several chosen layers
    
    Arguments:
    model -- our tensorflow model
    STYLE_LAYERS -- A python list containing:
                        - the names of the layers we would like to extract style from
                        - a coefficient for each of them
    
    Returns: 
    J_style -- tensor representing a scalar value, style cost defined above by equation (2)
    """
    
    # initialize the overall style cost
    J_style = 0

    for layer_name, coeff in STYLE_LAYERS:

        # Select the output tensor of the currently selected layer
        out = model[layer_name]

        # Set a_S to be the hidden layer activation from the layer we have selected, by running the session on out
        a_S = sess.run(out)

        # Set a_G to be the hidden layer activation from same layer. Here, a_G references model[layer_name] 
        # and isn't evaluated yet. Later in the code, we'll assign the image G as the model input, so that
        # when we run the session, this will be the activations drawn from the appropriate layer, with G as input.
        a_G = out
        
        # Compute style_cost for the current layer
        J_style_layer = compute_layer_style_cost(a_S, a_G)

        # Add coeff * J_style_layer of this layer to overall style cost
        J_style += coeff * J_style_layer

    return J_style

# GRADED FUNCTION: total_cost
# https://yoohannah.github.io/image/deepLearning/208.png
# The total cost is a linear combination of the content cost  𝐽𝑐𝑜𝑛𝑡𝑒𝑛𝑡(𝐶,𝐺)  and the style cost  𝐽𝑠𝑡𝑦𝑙𝑒(𝑆,𝐺) .
# 𝛼  and  𝛽  are hyperparameters that control the relative weighting between content and style.
def total_cost(J_content, J_style, alpha = 10, beta = 40):
    """
    Computes the total cost function
    
    Arguments:
    J_content -- content cost coded above
    J_style -- style cost coded above
    alpha -- hyperparameter weighting the importance of the content cost
    beta -- hyperparameter weighting the importance of the style cost
    
    Returns:
    J -- total cost as defined by the formula above.
    """
    
    ### START CODE HERE ### (≈1 line)
    J = alpha * J_content + beta * J_style
    ### END CODE HERE ###
    
    return J


content_image = imread("images/louvre_small.jpg")
content_image = reshape_and_normalize_image(content_image)

style_image = imread("images/monet.jpg")
style_image = reshape_and_normalize_image(style_image)

# initialize the "generated" image as a noisy image created from the content_image.

#  The generated image is slightly correlated with the content image.
#  By initializing the pixels of the generated image to be mostly noise 
#  but slightly correlated with the content image, 
#  this will help the content of the "generated" image more rapidly match the content of the "content" image.
generated_image = generate_noise_image(content_image)
imshow(generated_image[0])

model = load_vgg_model("pretrained-model/imagenet-vgg-verydeep-19.mat")


# 打印模型结构
model.summary()

# 获取特定层的激活值
layer_name = 'conv4_2'
intermediate_layer_model = model(inputs=model.input, outputs=model.get_layer(layer_name).output)

# 获取内容图像的激活值
a_C = intermediate_layer_model(content_image)

# 这里 a_G 是一个张量，尚未计算
a_G = intermediate_layer_model(model.input)

# 计算内容损失
J_content = compute_content_cost(a_C, a_G)

# 获取样式图像的激活值
style_activations = intermediate_layer_model(style_image)

# 计算样式损失
J_style = compute_style_cost(model, STYLE_LAYERS)

J = total_cost(J_content, J_style, 10, 40)

# 优化器
optimizer = tf.optimizers.Adam(learning_rate=0.01)

# 训练步骤
@tf.function
def train_step():
    with tf.GradientTape() as tape:
        a_G = intermediate_layer_model(generated_image)
        J_content = compute_content_cost(a_C, a_G)
        J_style = compute_style_cost(model, STYLE_LAYERS, style_image)
        J = J_content + J_style
    grads = tape.gradient(J, generated_image)
    optimizer.apply_gradients([(grads, generated_image)])
    return J, J_content, J_style

# 训练模型
def model_nn(input_image, num_iterations=200):
    generated_image.assign(input_image)
    
    for i in range(num_iterations):
        Jt, Jc, Js = train_step()

        # 每20次迭代打印一次损失
        if i % 20 == 0:
            print("Iteration " + str(i) + " :")
            print("total cost = " + str(Jt.numpy()))
            print("content cost = " + str(Jc.numpy()))
            print("style cost = " + str(Js.numpy()))
            
            # 保存当前生成的图像
            save_image("output/" + str(i) + ".png", generated_image.numpy())
    
    # 保存最终生成的图像
    save_image('output/generated_image.jpg', generated_image.numpy())
    
    return generated_image

# 确保输出目录存在
os.makedirs('output', exist_ok=True)

# 运行模型
result = model_nn(content_image)
