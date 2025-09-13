import PyPDF2, os

print(os.getcwd())

os.chdir('/Users/bytedance/project/LLM/llamaIndex')
def extract_first_two_pages(input_file, output_folder):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    # 构建输入和输出文件的路径
    input_path = f'data/{input_file}'
    output_path = f'{output_folder}/樱木花道人物介绍3.pdf'
    
    # 读取原始 PDF 文件
    with open(input_path, 'rb') as infile:
        reader = PyPDF2.PdfReader(infile)
        
        # 创建 PDF 编写器对象
        writer = PyPDF2.PdfWriter()
        
        # 读取前两页并写入到新的 PDF 文件
        # for page_num in range(min(2, len(reader.pages))):
        #     page = reader.pages[page_num]
        #     writer.add_page(page)

        page = reader.pages[1]
        writer.add_page(page)
        
        # 将新的 PDF 文件写入到指定的文件夹
        with open(output_path, 'wb') as outfile:
            writer.write(outfile)

# 示例用法
input_pdf = '樱木花道人物介绍2.pdf'  # 输入 PDF 文件名
output_folder = 'data'  # 输出文件夹
extract_first_two_pages(input_pdf, output_folder)

