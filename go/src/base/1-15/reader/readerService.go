package reader

import (
	"1-15/common"
	"fmt"
)

type ReaderService struct {
	readers []*Reader
}

func (s *ReaderService) AddReader(Name string, Password string, Address Address) (*Reader, error) {
	reader, err := CreateReader(Name, Password, Address)
	if err != nil {
		return nil, err
	}
	s.readers = append(s.readers, reader)
	return reader, nil
}

func (s *ReaderService) FindReaderByName(Name string) (*Reader, int, error) {
	for i, reader := range s.readers {
		if reader.Name == Name {
			return reader, i, nil
		}
	}
	return nil, -1, fmt.Errorf("读者不存在	")
}

func (s *ReaderService) FindReaderById(Id int) (*Reader, int, error) {
	for i, reader := range s.readers {
		if reader.Id == Id {
			return reader, i, nil
		}
	}
	return nil, -1, fmt.Errorf("读者不存在	")
}

func (s *ReaderService) DropReaderById(Id int) error {
	_, pos, err := s.FindReaderById(Id)
	if pos == -1 {
		return err
	}
	copy(s.readers[:pos], s.readers[pos+1:])
	s.readers[len(s.readers)-1] = nil
	s.readers = s.readers[:len(s.readers)-1]

	common.LogOperation("DropReaderById success" + fmt.Sprintf("ID: %d", Id))
	return nil
}

func (s *ReaderService) ListAllReaders() {
	for _, reader := range s.readers {
		reader.ShowReaderInfo()
	}
}

func NewReaderService() *ReaderService {
	return &ReaderService{
		readers: make([]*Reader, 0),
	}
}
