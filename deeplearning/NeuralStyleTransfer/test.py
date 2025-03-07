from keras.models import load_model

# 指定手动下载的权重文件路径

model = load_model("model_data/vgg19_weights_th_dim_ordering_th_kernels.h5")

model.summary()