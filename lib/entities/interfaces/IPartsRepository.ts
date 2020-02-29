import { IInMemoryRepository } from "./IInMemoryRepository";
import IPart from "./IPart";


type IPartsRepository = IInMemoryRepository<IPart> & {
  list: () => { partId: string }[],
};

export default IPartsRepository;