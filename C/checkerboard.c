//��̤��������
//�������������Ϊ8*8�ķ������̣��ֽ�������������ָ���ķ����У����ա�������Ĺ��򽫡��������ƶ�
//Ҫ��ÿ������ֻ�ܽ���һ�Σ�����ʹ�á����߱�����64������
#include <stdio.h>
#include <time.h>

#define X 8
#define Y 8

int chess[X][Y];

//�ҵ�����(x,y)λ�õ���һ�����ߵ�λ��
int nextxy(int *x,int *y,int count)
{
	//ÿ����������жϣ���Ҫ����λ������������֮ǰû�б�����
	switch(count) 
	{
	case 0:
		if(*x+2<=X-1 && *y-1>=0 && chess[*x+2][*y-1]==0) //3λ��
		{
			*x += 2;
			*y -= 1;
			return 1;
		}
		break;

	case 1:
		if(*x+2<=X-1 && *y+1<=Y-1 && chess[*x+2][*y+1]==0)//4λ��
		{
			*x += 2;
			*y += 1;
			return 1;
		}
		break;

	case 2:
		if(*x+1<=X-1 && *y-2>=0 && chess[*x+1][*y-2]==0)//2λ��
		{
			*x = *x + 1;
			*y = *y - 2;
			return 1;
		}
		break;

	case 3:
		if(*x+1<=X-1 && *y+2<=Y-1 && chess[*x+1][*y+2]==0)//5λ��
		{
			*x = *x + 1;
			*y = *y + 2;
			return 1;
		}
		break;

	case 4:
		if(*x-2>=0 && *y-1>=0 && chess[*x-2][*y-1]==0)//8λ��
		{
			*x = *x - 2;
			*y = *y - 1;
			return 1;
		}
		break;

	case 5:
		if(*x-2>=0 && *y+1<=Y-1 && chess[*x-2][*y+1]==0)//7λ��
		{
			*x = *x - 2;
			*y = *y + 1;
			return 1;
		}
		break;
	
	case 6:
		if(*x-1>=0 && *y-2>=0 && chess[*x-1][*y-2]==0)//1λ��
		{
			*x = *x - 1;
			*y = *y - 2;
			return 1;
		}
		break;

	case 7:
		if(*x-1>=0 && *y+2<=Y-1 && chess[*x-1][*y+2]==0)//6λ��
		{
			*x = *x - 1;
			*y = *y + 2;
			return 1;
		}
		break;

	default:
		break;
	}
	return 0;
}
void print()
{
	int i,j;
	for( i=0;i<X;i++)
	{
		for(j=0;j<Y;j++)
		{
			printf("%2d\t",chess[i][j]);
		}
		printf("\n");
	}
		printf("\n");
}
//������ȱ�������
//(x,y)Ϊλ������
//tag�Ǳ�Ǳ�����ÿ��һ����tag+1
int TravelChessBoard(int x,int y,int tag)
{
	int x1 = x,y1 = y,flag = 0,count = 0;
	chess[x][y] = tag;
	if(X*Y == tag)
	{ 
		//��ӡ����
		print();
		return 1;
	}

	//�ҵ������һ�����ߵ�����(x1,y1),����ҵ�flag=1,����Ϊ0
	flag = nextxy(&x1,&y1,count);
	while( 0 == flag && count< 7)
	{
		count++;
		flag = nextxy(&x1,&y1,count);
	}
	while(flag)
	{
		if( TravelChessBoard(x1,y1,tag+1))
		{
			return 1;
		}

		//�����ҵ������һ�����ߵ�����,����ҵ�flag=1,����Ϊ0
		x1 = x;
		y1 = y;
		count++;
		
		flag = nextxy(&x1,&y1,count);
		while( 0 == flag && count< 7)
		{
			count++;
			flag = nextxy(&x1,&y1,count);
		}
	}
	if( 0 == flag )
	{
		chess[x][y] = 0;
	}
	return 0;
}

int main()
{
	int i,j;
	clock_t start,finish;

	start = clock();
	
	for( i=0; i < X; i++ )
	{
	
		for( j=0;j < Y; j++ )
		{
			chess[i][j] = 0;
		}
	}
	if( !TravelChessBoard(2, 0, 1) )
	{
		printf("��Ǹ����̤����ʧ����\n");
	}
	finish = clock();
	printf("\n���μ���һ�ֺ�ʱ��%f��\n\n",(double)(finish-start)/CLOCKS_PER_SEC);
	return 0;
}
