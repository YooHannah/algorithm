# 在tensorflow 官网实例基础上处理多个乐器的情况， 原实验跑不通
# https://www.tensorflow.org/tutorials/audio/music_generation?hl=zh-cn
# 最终产出midi 文件效果不是很好
import collections
import glob
import numpy as np
import pathlib
import pandas as pd
import pretty_midi
import seaborn as sns
import tensorflow as tf
import pygame
from matplotlib import pyplot as plt
from typing import Optional


# seed = 42
# tf.random.set_seed(seed)
# np.random.seed(seed)

# Sampling rate for audio playback
_SAMPLING_RATE = 16000

filenames = glob.glob('data/original_metheny.mid')
print('Number of files:', len(filenames))

sample_file = filenames[0]
print(sample_file)



# 为 MIDI 文件生成 PrettyMIDI 对象。
pm = pretty_midi.PrettyMIDI(sample_file)

# 播放文件
def play_midi(file_path):
    # 初始化pygame
    pygame.init()
    pygame.mixer.init()

    # 加载并播放MIDI文件
    pygame.mixer.music.load(file_path)
    pygame.mixer.music.play()

    print("Press 'p' to pause, 'r' to resume, and 'q' to quit.")
    
    while True:
        command = input("Enter command: ")
        
        if command == 'p':
            pygame.mixer.music.pause()
            print("Music paused.")
        elif command == 'r':
            pygame.mixer.music.unpause()
            print("Music resumed.")
        elif command == 'q':
            pygame.mixer.music.stop()
            print("Music stopped.")
            break
        else:
            print("Invalid command. Use 'p' to pause, 'r' to resume, and 'q' to quit.")

print('______play original_metheny.mid______')
play_midi('data/original_metheny.mid')
# play_midi('tempfile.mid')

# 对 MIDI 文件进行一些检查。
print('Number of instruments:', len(pm.instruments))
instrument_name_list = {}
pos = 0
for instrument in pm.instruments:
  instrument_name = pretty_midi.program_to_instrument_name(instrument.program)
  print('EVERY Instrument name:', instrument_name)
  instrument_name_list[pos] = instrument_name
  pos += 1
instrument = pm.instruments[0]
instrument_name = pretty_midi.program_to_instrument_name(instrument.program)
print('Instrument name:', instrument_name)

# 获取音符的名称 起始和结束时间。
for i, note in enumerate(instrument.notes[:10]):
  note_name = pretty_midi.note_number_to_name(note.pitch)
  duration = note.end - note.start
  print(f'{i}: pitch={note.pitch}, note_name={note_name},'
        f' duration={duration:.4f}')
  
# 从MIDI 文件中提取音符。
def midi_to_notes(midi_file: str) -> pd.DataFrame:
  pm = pretty_midi.PrettyMIDI(midi_file)
  # instrument = pm.instruments[1]  # 选择第一个乐器
  notes = collections.defaultdict(list)

  for instrument_index, instrument in enumerate(pm.instruments):
    # Sort the notes by start time
    sorted_notes = sorted(instrument.notes, key=lambda note: note.start)
    prev_start = sorted_notes[0].start

    for note in sorted_notes:
      start = note.start
      end = note.end
      notes['instrument'].append(instrument_index)
      notes['pitch'].append(note.pitch)
      notes['start'].append(start)
      notes['end'].append(end)
      notes['step'].append(start - prev_start)
      notes['duration'].append(end - start)
      prev_start = start

  return pd.DataFrame({name: np.array(value) for name, value in notes.items()})

raw_notes = midi_to_notes(sample_file)
print(raw_notes.head())
# 将数字音高值转换为音符名称。音符名称显示了音符类型、变音记号和八度数（例如 C#4）。
get_note_names = np.vectorize(pretty_midi.note_number_to_name)
sample_note_names = get_note_names(raw_notes['pitch'])
sample_note_names[:10]
print(sample_note_names)

# 要呈现乐曲，绘制音高、音轨（即钢琴卷帘）时长的开始点和结束点。从前 100 个音符开始
def plot_piano_roll(notes: pd.DataFrame, count: Optional[int] = None):
  if count:
    title = f'First {count} notes'
  else:
    title = f'Whole track'
    count = len(notes['pitch'])
  plt.figure(figsize=(20, 4))
  plot_pitch = np.stack([notes['pitch'], notes['pitch']], axis=0)
  plot_start_stop = np.stack([notes['start'], notes['end']], axis=0)
  plt.plot(
      plot_start_stop[:, :count], plot_pitch[:, :count], color="b", marker=".")
  plt.xlabel('Time [s]')
  plt.ylabel('Pitch')
  _ = plt.title(title)
  plt.show()

plot_piano_roll(raw_notes, count=100)
# 绘制整个音轨的音符
plot_piano_roll(raw_notes)

# 检查每个音符变量的分布。
def plot_distributions(notes: pd.DataFrame, drop_percentile=2.5):
  plt.figure(figsize=[15, 5])
  plt.subplot(1, 3, 1)
  sns.histplot(notes, x="pitch", bins=20)

  plt.subplot(1, 3, 2)
  max_step = np.percentile(notes['step'], 100 - drop_percentile)
  sns.histplot(notes, x="step", bins=np.linspace(0, max_step, 21))
  
  plt.subplot(1, 3, 3)
  max_duration = np.percentile(notes['duration'], 100 - drop_percentile)
  sns.histplot(notes, x="duration", bins=np.linspace(0, max_duration, 21))
  plt.show()

plot_distributions(raw_notes)
# 从音符列表中生成自己的 MIDI 文件
# def notes_to_midi(
#   notes: pd.DataFrame,
#   out_file: str, 
#   instrument_name: str,
#   velocity: int = 100,  # note loudness
# ) -> pretty_midi.PrettyMIDI:

#   pm = pretty_midi.PrettyMIDI()
#   instrument = pretty_midi.Instrument(
#       program=pretty_midi.instrument_name_to_program(
#           instrument_name))

#   prev_start = 0
#   for i, note in notes.iterrows():
#     start = float(prev_start + note['step'])
#     end = float(start + note['duration'])
#     note = pretty_midi.Note(
#         velocity=velocity,
#         pitch=int(note['pitch']),
#         start=start,
#         end=end,
#     )
#     instrument.notes.append(note)
#     prev_start = start

#   pm.instruments.append(instrument)
#   pm.write(out_file)
#   return pm

def notes_to_midi(
    notes: pd.DataFrame,
    out_file: str,
    instrument_names: dict,
    velocity: int = 100,  # note loudness
) -> pretty_midi.PrettyMIDI:
  pm = pretty_midi.PrettyMIDI()
  instruments = {}

  # Create instruments based on provided names
  for instrument_index, instrument_name in instrument_names.items():
      instruments[instrument_index] = pretty_midi.Instrument(
          program=pretty_midi.instrument_name_to_program(instrument_name)
      )

  prev_start = {instrument_index: 0 for instrument_index in instruments.keys()}
  
  for i, note in notes.iterrows():
      instrument_index = note['instrument']
      midi_note = pretty_midi.Note(
          velocity=velocity, # 所有乐器音高相同，听起来不是特别舒服
          pitch=int(note['pitch']),
          start=note.start,
          end=note.end,
      )
      instruments[instrument_index].notes.append(midi_note)
      prev_start[instrument_index] = note.start

  for instrument in instruments.values():
      pm.instruments.append(instrument)
      
  pm.write(out_file)
  return pm


example_file = 'example.midi'
example_pm = notes_to_midi(
    raw_notes, out_file=example_file, instrument_names=instrument_name_list)

print('example.midi')
play_midi(example_file)
# 创建训练集

num_files = 5
all_notes = []
# for f in filenames[:num_files]: // 先拿一个文件试试
#   notes = midi_to_notes(f)
#   all_notes.append(notes)
notes = midi_to_notes(sample_file)
all_notes.append(notes)
all_notes = pd.concat(all_notes)

n_notes = len(all_notes)
print('Number of notes parsed:', n_notes)

# 接下来，从已解析的音符创建 tf.data.Dataset
key_order = ['instrument', 'pitch', 'step', 'duration']
train_notes = np.stack([all_notes[key] for key in key_order], axis=1)

notes_ds = tf.data.Dataset.from_tensor_slices(train_notes)
print(notes_ds.element_spec)

# 针对成批的音符序列训练模型。每个样本将包含一系列音符作为输入特征，下一个音符作为标签。
# 通过这种方式，模型将被训练来预测序列中的下一个音符。
# 可以使用大小为 seq_length 的方便 window 函数来创建这种格式的特征和标签。
def create_sequences(
    dataset: tf.data.Dataset, 
    seq_length: int,
    vocab_size = 128,
) -> tf.data.Dataset:
  """Returns TF Dataset of sequence and label examples."""
  seq_length = seq_length+1

  # Take 1 extra for the labels
  windows = dataset.window(seq_length, shift=1, stride=1,
                              drop_remainder=True)

  # `flat_map` flattens the" dataset of datasets" into a dataset of tensors
  flatten = lambda x: x.batch(seq_length, drop_remainder=True)
  sequences = windows.flat_map(flatten)
  
  # Normalize note pitch
  def scale_pitch(x):
    x = x/[1.0, vocab_size,1.0,1.0]
    return x

  # Split the labels
  def split_labels(sequences):
    inputs = sequences[:-1]
    labels_dense = sequences[-1]
    labels = {key:labels_dense[i] for i,key in enumerate(key_order)}

    return scale_pitch(inputs), labels

  return sequences.map(split_labels, num_parallel_calls=tf.data.AUTOTUNE)

# 为每个样本设置序列长度。尝试不同的长度（例如 50、100、150），看看哪一个最适合数据，或者使用超参数调优。
# 词汇表的大小 (vocab_size) 设置为 128，表示 pretty_midi 支持的所有音高。

seq_length = 25
vocab_size = 128
seq_ds = create_sequences(notes_ds, seq_length, vocab_size)
print(seq_ds.element_spec)

# 数据集的形状为 (100,1)，表示模型将以 100 个音符作为输入，并学习预测以下音符作为输出
for seq, target in seq_ds.take(1):
  print('sequence shape:', seq.shape)
  print('sequence elements (first 10):', seq[0: 10])
  print()
  print('target:', target)

# 对样本进行批处理，并配置数据集以提高性能
batch_size = 64
buffer_size = n_notes - seq_length  # the number of items in the dataset
train_ds = (seq_ds
            .shuffle(buffer_size)
            .batch(batch_size, drop_remainder=True)
            .cache()
            .prefetch(tf.data.experimental.AUTOTUNE))

print(train_ds.element_spec)

# 创建并训练模型
# 该模型将具有三个输出，每个音符变量使用一个输出。对于 step 和 duration，将使用基于均方误差的自定义损失函数，以鼓励模型输出非负值。

def mse_with_positive_pressure(y_true: tf.Tensor, y_pred: tf.Tensor):
  mse = (y_true - y_pred) ** 2
  positive_pressure = 10 * tf.maximum(-y_pred, 0.0)
  return tf.reduce_mean(mse + positive_pressure)

input_shape = (seq_length, 4)
learning_rate = 0.005

inputs = tf.keras.Input(input_shape)
x = tf.keras.layers.LSTM(128)(inputs)

outputs = {
  'instrument': tf.keras.layers.Dense(19, activation='softmax', name='instrument')(x),
  'pitch': tf.keras.layers.Dense(128, name='pitch')(x),
  'step': tf.keras.layers.Dense(1, name='step')(x),
  'duration': tf.keras.layers.Dense(1, name='duration')(x),
}

model = tf.keras.Model(inputs, outputs)

loss = {
      'pitch': tf.keras.losses.SparseCategoricalCrossentropy(
          from_logits=True),
      'step': mse_with_positive_pressure,
      'duration': mse_with_positive_pressure,
      'instrument': tf.keras.losses.SparseCategoricalCrossentropy
}

optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)

model.compile(loss=loss, optimizer=optimizer)

model.summary()

# 测试 model.evaluate 函数，可以看到 pitch 损失明显大于 step 和 duration 损失。
# 请注意，loss 是通过对所有其他损失求和计算得出的总损失，目前主要由 pitch 损失决定。

losses = model.evaluate(train_ds, return_dict=True)

# 平衡这种情况的一种方式是使用 loss_weights 参数进行编译：
model.compile(
    loss=loss,
    loss_weights={
        'instrument': 1.0,
        'pitch': 0.05,
        'step': 1.0,
        'duration':1.0,
    },
    optimizer=optimizer,
)

model.evaluate(train_ds, return_dict=True)

# 训练模型

callbacks = [
    tf.keras.callbacks.ModelCheckpoint(
        filepath='./training_checkpoints/ckpt_{epoch}.weights.h5',
        save_weights_only=True),
    tf.keras.callbacks.EarlyStopping(
        monitor='loss',
        patience=5,
        verbose=1,
        restore_best_weights=True),
]

epochs = 50

history = model.fit(
    train_ds,
    epochs=epochs,
    callbacks=callbacks,
)

plt.plot(history.epoch, history.history['loss'], label='total loss')
plt.show()

# 生成一些音符。可以在 next_notes 中调整温度和起始序列，
def predict_next_note(
    notes: np.ndarray, 
    keras_model: tf.keras.Model, 
    temperature: float = 1.0) -> tuple[int, int, float, float]:
  """Generates a note as a tuple of (pitch, step, duration), using a trained sequence model."""

  assert temperature > 0

  # Add batch dimension
  inputs = tf.expand_dims(notes, 0)

  predictions = model.predict(inputs)
  pitch_logits = predictions['pitch']
  step = predictions['step']
  duration = predictions['duration']
  instrument_logits = predictions['instrument']
 
  pitch_logits /= temperature
  pitch = tf.random.categorical(pitch_logits, num_samples=1)
  pitch = tf.squeeze(pitch, axis=-1)
  duration = tf.squeeze(duration, axis=-1)
  step = tf.squeeze(step, axis=-1)
  instrument_logits /= temperature
  instrument = tf.random.categorical(instrument_logits, num_samples=1)

  # `step` and `duration` values should be non-negative
  step = tf.maximum(0, step)
  duration = tf.maximum(0, duration)
  # instrument = tf.maximum(0, instrument)

  return int(instrument), int(pitch), float(step), float(duration)

temperature = 2.0
num_predictions = 600

sample_notes = np.stack([raw_notes[key] for key in key_order], axis=1)

# The initial sequence of notes; pitch is normalized similar to training
# sequences
input_notes = (
    sample_notes[:seq_length] / np.array([1, vocab_size, 1, 1]))

generated_notes = []
prev_start = 0
for _ in range(num_predictions):
  instrument, pitch, step, duration = predict_next_note(input_notes, model, temperature)
  start = prev_start + step
  end = start + duration
  input_note = (instrument, pitch, step, duration)
  generated_notes.append((*input_note, start, end))
  input_notes = np.delete(input_notes, 0, axis=0)
  input_notes = np.append(input_notes, np.expand_dims(input_note, 0), axis=0)
  prev_start = start

generated_notes = pd.DataFrame(
    generated_notes, columns=(*key_order, 'start', 'end'))

print(generated_notes.head(10))

out_file = 'output.mid'
out_pm = notes_to_midi(
    generated_notes, out_file=out_file, instrument_names=instrument_name_list)

# 呈现生成的音符
plot_piano_roll(generated_notes)
# 检查 pitch、step 和 duration 的分布。
plot_distributions(generated_notes)

print('______play output.mid______')
play_midi(out_file)