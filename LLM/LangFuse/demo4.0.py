from datasets import load_dataset
dataset = load_dataset("liwu/MNBVC", 'math_qa', split='train', streaming=True)

# next(iter(dataset))  # get the first line

itemes = iter(dataset)
for i in range(5):
    item = next(itemes)
    answer = item["答"].split()[1]
    print(f'position {i} \n item : {item} \n 问题: {item["问"]} \n 答案: {answer}')
