#include<stdio.h>
#define MAXSIZE 10
typedef struct
{
 int data;
 int cur;
}StaticLinkList[MAXSIZE];

//	��̬�����ʼ��
void InitList(StaticLinkList L)//�����б�
{
 int i;
 for(i = 1; i < MAXSIZE-1; i++ )
 {	if(i==7){
	 L[i].cur = 0;
	}else{
	 L[i].cur = i+2;
	}
	 L[i].data = i;
	 ++i;
 }
 for(i = 0; i < MAXSIZE-1; i++ )
 {	
	if(i==MAXSIZE-2){
	 L[i].cur = 0;
	}else{
	 L[i].cur = i+2;
	}
	 ++i;
 }
 L[MAXSIZE-1].cur = 1;
// for(i = 0; i < MAXSIZE; i++ ){
//   printf("%d %d %d\n",i,L[i].data,L[i].cur);
// }
}

//������������Ԫ�ظ�����
int length(StaticLinkList L){
	int k,j;
	j=0;
	k=L[MAXSIZE-1].cur;
	while(k){
		k=L[k].cur;
		j++;
	}
	printf("��:%d\n",j);
	return j;
}
//	�ڵ�n��Ԫ��ǰ����Ԫ��e
void insert(StaticLinkList L,int e,int n){
	int ll=length(L);
	int i,k,m;
	if(n<1||n>9){
		printf("�����λ�ò�����!");
		return ;
	}
	if(ll==MAXSIZE-2){
		printf("��������!");
		return;
	}
	k = L[MAXSIZE-1].cur;
	for(i=0;i<n-1;i++){
		k=L[k].cur;
	}
	m = L[0].cur;
	L[0].cur = L[L[0].cur].cur;
    L[m].data = e;
	L[m].cur = k;
	L[L[MAXSIZE-1].cur].cur = m;	
	for(i = 0; i < MAXSIZE; i++ ){
    printf("%d %d %d\n",i,L[i].data,L[i].cur);
	}
	length(L);
}
//ɾ����n��λ��Ԫ��(��ɾ����λ���ϻ�������)
void del(StaticLinkList L,int n){
	int i,k,m;
	if(n<1||n>9){
		printf("ɾ����λ�ò�����!");
		return ;
	}
	k = MAXSIZE-1;
	for(i=1;i<n;i++){
		k=L[k].cur;	
	}
	printf("%d\n",k);
	m=L[k].cur;
	L[k].cur =L[L[k].cur].cur;
	L[m].cur = L[0].cur;
	L[0].cur = m;
	
	for(i = 0; i < MAXSIZE; i++ ){
    printf("%d %d %d\n",i,L[i].data,L[i].cur);
	}
	length(L);
}
StaticLinkList randlist(int n){
	StaticLinkList L;
	for(i = 1;i<n-1;i++){
		L[i].data = rand() % 101;
		L[i].cur = i+1;
	}
	
}
void main()
{
 StaticLinkList list; 
 InitList(list);
 length(list);
 insert(list,77,2);
 del(list,1);
 randlist(20);
}