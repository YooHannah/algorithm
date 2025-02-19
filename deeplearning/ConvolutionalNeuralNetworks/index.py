import tensorflow as tf

from tensorflow.keras import datasets, layers, models
import matplotlib.pyplot as plt
import numpy as np
import h5py

def convert_to_one_hot(Y, C):
    Y = np.eye(C)[Y.reshape(-1)].T
    return Y
def load_dataset():
    train_dataset = h5py.File('datasets/train_signs.h5', "r")
    train_set_x_orig = np.array(train_dataset["train_set_x"][:]) # your train set features
    train_set_y_orig = np.array(train_dataset["train_set_y"][:]) # your train set labels

    test_dataset = h5py.File('datasets/test_signs.h5', "r")
    test_set_x_orig = np.array(test_dataset["test_set_x"][:]) # your test set features
    test_set_y_orig = np.array(test_dataset["test_set_y"][:]) # your test set labels

    classes = np.array(test_dataset["list_classes"][:]) # the list of classes
    
    train_set_y_orig = train_set_y_orig.reshape((1, train_set_y_orig.shape[0]))
    test_set_y_orig = test_set_y_orig.reshape((1, test_set_y_orig.shape[0]))
    
    return train_set_x_orig, train_set_y_orig, test_set_x_orig, test_set_y_orig, classes

X_train_orig, Y_train_orig, X_test_orig, Y_test_orig, classes = load_dataset()



X_train = X_train_orig/255.
X_test = X_test_orig/255.
Y_train = Y_train_orig.reshape(-1)
Y_test = Y_test_orig.reshape(-1)
print ("number of training examples = " + str(X_train.shape[0]))
print ("number of test examples = " + str(X_test.shape[0]))
print ("X_train shape: " + str(X_train.shape))
print ("Y_train shape: " + str(Y_train.shape))
print ("X_test shape: " + str(X_test.shape))
print ("Y_test shape: " + str(Y_test.shape))

# 看看前25张图片和label
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
# model = tf.keras.Sequential([
#     tf.keras.layers.Flatten(input_shape=(28, 28)),
#     tf.keras.layers.Dense(128, activation='relu'),
#     tf.keras.layers.Dense(10)
# ])
model = models.Sequential()
model.add(layers.Conv2D(32, (3, 3), activation='relu', input_shape=(64, 64, 3)))
model.add(layers.MaxPooling2D((2, 2)))
model.add(layers.Conv2D(64, (3, 3), activation='relu'))
model.add(layers.MaxPooling2D((2, 2)))
model.add(layers.Conv2D(64, (3, 3), activation='relu'))
model.add(layers.Flatten())
model.add(layers.Dense(64, activation='relu'))
model.add(layers.Dense(6))
model.summary()
# 在准备对模型进行训练之前，还需要再对其进行一些设置。以下内容是在模型的编译步骤中添加的：
# 损失函数 - 测量模型在训练期间的准确程度。你希望最小化此函数，以便将模型“引导”到正确的方向上。
# 优化器 - 决定模型如何根据其看到的数据和自身的损失函数进行更新。
# 指标 - 用于监控训练和测试步骤。以下示例使用了准确率，即被正确分类的图像的比率。
model.compile(optimizer='adam',
              loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
              metrics=['accuracy'])

# 要开始训练，调用 model.fit 方法，这样命名是因为该方法会将模型与训练数据进行“拟合”
# 1.将训练数据馈送给模型。
# 2.模型学习将图像和标签关联起来。
# 3.要求模型对测试集进行预测。
# 4.验证预测是否与 测试集 数组中的标签相匹配。
history = model.fit(X_train, Y_train, epochs=10, 
                    validation_data=(X_test, Y_test))


plt.plot(history.history['accuracy'], label='accuracy')
plt.plot(history.history['val_accuracy'], label = 'val_accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.ylim([0.5, 1])
plt.legend(loc='lower right')
plt.show()
# 接下来，比较模型在测试数据集上的表现
test_loss, test_acc = model.evaluate(X_test,  Y_test, verbose=2)

print(test_acc)

# 模型经过训练后，可以使用它对一些图像进行预测。附加一个 Softmax 层，将模型的线性输出 logits 转换成更容易理解的概率
probability_model = tf.keras.Sequential([model, 
                                         tf.keras.layers.Softmax()])

my_image = "thumbs_up.jpg"
fname = "images/" + my_image
image = np.array(plt.imread(fname))
plt.imshow(image/255)
plt.axis('off')  # 关闭坐标轴
plt.show()
print('my_image shape: ', image.shape)
image = np.expand_dims(image, axis=0)  # 使其形状变为 (1, 3024, 3024, 3)
# 确保图像数据类型是 float32 类型，通常卷积操作要求图像是浮动精度
image_tensor = tf.convert_to_tensor(image, dtype=tf.float32)
image_resized = tf.image.resize(image_tensor, [64, 64])
print('image_resized shape: ', image_resized.shape)
predictions = probability_model.predict(image_resized)

print('predictions', predictions, np.argmax(predictions[0]))

# 绘制前25个测试图像，显示其预测的标签
testInmages = predictions = probability_model.predict(X_test)
plt.figure(figsize=(10,10))
for i in range(25):
  plt.subplot(5,5,i+1)
  plt.xticks([])
  plt.yticks([])
  plt.grid(False)
  plt.imshow(X_test_orig[i])
  plt.xlabel(np.argmax(testInmages[i])) # 显示预测的标签
plt.show()