import tensorflow as tf

from tensorflow.keras import datasets, layers, models
import matplotlib.pyplot as plt
import numpy as np
import h5py
from kt_utils import *
from keras.preprocessing import image
from keras.applications.imagenet_utils import preprocess_input

X_train_orig, Y_train_orig, X_test_orig, Y_test_orig, classes = load_dataset()

# Normalize image vectors
X_train = X_train_orig/255.
X_test = X_test_orig/255.

X_train_padding = layers.ZeroPadding2D((3,3))(X_train)
X_test_padding =layers.ZeroPadding2D((3,3))(X_test)

# Reshape
Y_train = Y_train_orig.T
Y_test = Y_test_orig.T

print ("number of training examples = " + str(X_train.shape[0]))
print ("number of test examples = " + str(X_test.shape[0]))
print ("X_train shape: " + str(X_train.shape))
print ("Y_train shape: " + str(Y_train.shape))
print ("X_test shape: " + str(X_test.shape))
print ("Y_test shape: " + str(Y_test.shape))

plt.figure(figsize=(10,10))
for i in range(25):
    plt.subplot(5,5,i+1)
    plt.xticks([])
    plt.yticks([])
    plt.grid(False)
    plt.imshow(X_train_orig[i])
    plt.xlabel(str(np.squeeze(Y_train_orig[:, i])))
plt.show()
# 也可以一次性设置

model = tf.keras.Sequential([
    layers.Conv2D(32, (7, 7), strides = (1, 1), name = 'conv0'),
    layers.BatchNormalization(axis = 3, name = 'bn0'),
    layers.Activation('relu'),
    layers.MaxPooling2D((2, 2), name='max_pool'),
    layers.Flatten(),
    layers.Dense(1, activation='sigmoid', name='fc'),
])
model.summary()
model.compile(optimizer='adam',
              loss=tf.keras.losses.BinaryCrossentropy(from_logits=True),
              metrics=['accuracy'])

history = model.fit(X_train_padding, Y_train, batch_size=32, epochs=20, validation_data=(X_test_padding, Y_test))

plt.plot(history.history['accuracy'], label='accuracy')
plt.plot(history.history['val_accuracy'], label = 'val_accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.ylim([0.5, 1])
plt.legend(loc='lower right')
plt.show()

test_acc = model.evaluate(X_test_padding, Y_test)
print(test_acc)

img_path = 'images/my_image.jpg'
image = np.array(plt.imread(img_path))
plt.imshow(image/255)
plt.axis('off')  # 关闭坐标轴
plt.show()
print('my_image shape: ', image.shape)
image = np.expand_dims(image, axis=0)  # 使其形状变为 (1, 64, 64, 3)
image_tensor = tf.convert_to_tensor(image, dtype=tf.float32)
image_resized = tf.image.resize(image_tensor, [64, 64])
print('image_resized shape: ', image_resized.shape)
image_padding = layers.ZeroPadding2D((3,3))(image_resized) ### 注意训练数据进行了padding 处理，预测数据也要是相同形状的
predictions = model.predict(image_padding)

print(predictions)