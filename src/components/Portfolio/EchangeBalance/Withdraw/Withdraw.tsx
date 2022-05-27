import styles from './Withdraw.module.css';
import WithdrawButton from './WithdrawButton/WithdrawButton';
import WithdrawCurrencySelector from './WithdrawCurrencySelector/WithdrawCurrencySelector';

export default function Withdraw() {
    return (
        <div className={styles.deposit_container}>
            <div className={styles.info_text}>
                Deposit tokens to Ambient Finance exchange wallet
            </div>
            <WithdrawCurrencySelector fieldId='exchange-balance-withdraw' />
            <WithdrawButton />
        </div>
    );
}
