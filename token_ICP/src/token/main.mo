import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";



actor Token {

    var owner : Principal = Principal.fromText("y5zje-ghebi-66zen-bsw4n-xx6lj-4sjuw-4gjpm-klpd2-eilh2-s5wwa-sqe");

    var totalSupply:Nat = 1000000000;

    var symbol: Text = "CEN";

    private var balanceEntries: [(Principal, Nat)] = [];

    private var balances = HashMap.HashMap<Principal, Nat>(1, Principal.equal, Principal.hash);
    if (balances.size() < 1){
        balances.put(owner, totalSupply);
    };

    // array --> hashmap
    system func postupgrade(){
        balances := HashMap.fromIter<Principal,Nat>(balanceEntries.vals(), 1, Principal.equal, Principal.hash);

    }; 

    public query func balanceOf(who: Principal): async Nat{
        // // let balance = await balances.get(who);
        // if (balances.get(who) == null){
        //     return 0;
        // }
        // else{
        //     return balances.get(who); /// it returns a value of type async Nat, which represents a promise that resolves to a Nat.
        // }

        let balance: Nat = switch (balances.get(who)){
            case null 0;
            case (?result) result;
        };

        return balance;
    };

    public query func getSymbal(): async Text{
        return symbol;
    };

    public shared(msg) func payOut(): async Text{
        Debug.print(debug_show(msg.caller));

        if (balances.get(msg.caller) == null){
            let amount = 100;
            // balances.put(msg.caller, amount);
            let result = await transfer(msg.caller,amount);
            return result;
        }
        else{
            return "already claimed!";
        }

    };

    public shared(msg) func transfer(to: Principal, amount:Nat): async Text{
        Debug.print(debug_show(msg.caller));

        let fromBalance = await balanceOf(msg.caller);
        if (fromBalance > amount){
            let newFromBalance: Nat = fromBalance - amount;
            balances.put(msg.caller, newFromBalance);

            let toBalance = await balanceOf(to);
            let newToBalance = toBalance + amount;
            balances.put(to, newToBalance);
            return "Success! ";
        }
        else{
            return "insufficient balance";
        }

    };

    // hashmap --> array
    system func preupgrade(){
        balanceEntries := Iter.toArray(balances.entries());
    };



}