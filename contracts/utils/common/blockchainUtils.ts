import { BrowserProvider, JsonRpcProvider } from "ethers";

export class Blockchain {
  public _provider: BrowserProvider | JsonRpcProvider;
  private _snapshotId: number;

  constructor(_provider: BrowserProvider | JsonRpcProvider) {
    this._provider = _provider;

    this._snapshotId = 0;
  }

  public async saveSnapshotAsync(): Promise<string> {
    const response = await this.sendJSONRpcRequestAsync("evm_snapshot", []);

    this._snapshotId = response;
    return response;
  }

  public async revertAsync(): Promise<void> {
    await this.sendJSONRpcRequestAsync("evm_revert", [this._snapshotId]);
  }

  public async revertByIdAsync(id: string): Promise<void> {
    await this.sendJSONRpcRequestAsync("evm_revert", [id]);
  }

  public async resetAsync(): Promise<void> {
    await this.sendJSONRpcRequestAsync("evm_revert", ["0x1"]);
  }

  public async getChainId(): Promise<BigInt> {
    return (await this._provider.getNetwork()).chainId;
  }

  public async increaseTimeAsync(duration: number): Promise<any> {
    await this.sendJSONRpcRequestAsync("evm_increaseTime", [duration]);
    await this.sendJSONRpcRequestAsync("evm_mine", []);
  }

  public async getCurrentTimestamp(): Promise<BigInt> {
    const block = await this._provider.getBlock(await this._provider.getBlockNumber());
    return block ? BigInt(block.timestamp) : BigInt(0);
  }

  public async setNextBlockTimestamp(timestamp: number): Promise<any> {
    await this.sendJSONRpcRequestAsync("evm_setNextBlockTimestamp", [timestamp]);
  }

  public async waitBlocksAsync(count: number) {
    for (let i = 0; i < count; i++) {
      await this.sendJSONRpcRequestAsync("evm_mine", []);
    }
  }

  public async getLatestBlockNumber(): Promise<BigInt> {
    const block = await this._provider.getBlock("latest");
    return block ? BigInt(block.number) : BigInt(0);
  }

  private async sendJSONRpcRequestAsync(method: string, params: any[]): Promise<any> {
    return this._provider.send(method, params);
  }
}
